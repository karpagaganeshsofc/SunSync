import { parseAlarmCommand } from '@/utils/aiUtils';
import { getCityCoordinates, getCoordinates } from '@/utils/locationUtils';
import { cancelAlarm, requestPermission, scheduleAlarm } from '@/utils/notificationUtils';
import { fetchSunRisePhoto } from '@/utils/photoUtils';
import { fetchSunriseTime } from '@/utils/sunriseUtils';
import { getCountDown } from '@/utils/timeUtils';
import { requestMicPermission } from '@/utils/voiceUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useEffect, useRef, useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [sunRise, setSunRise] = useState<string>("Loading...");
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();
  const [offset, setOffset]= useState<number>(0);
  const [countdown, setCountdown] = useState<string>("Calculating...");
  const [days, setDays] = useState<number[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  // state for the transcribed text
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);

  const transcriptRef = useRef<string>('');

  useEffect(() => {
    const load = async () => {
      let coords = await getCoordinates();
      if(!coords){
        const city = await AsyncStorage.getItem('fallbackCity');
        if (city) coords = await getCityCoordinates(city);
      }
      if (!coords) {
        setError(true);
        return;
      }
      const time = await fetchSunriseTime(coords.lat, coords.lng);
      if (time) setSunRise(time);
      else setError(true);

      // after fetching sunrise, also load saved alarm state
      const saved = await AsyncStorage.getItem('alarmEnabled');
      if (saved !== null) setIsEnabled(JSON.parse(saved));

      const savedOffset = await AsyncStorage.getItem('alarmOffset');
      if (savedOffset) setOffset(JSON.parse(savedOffset));

      const savedDays = await AsyncStorage.getItem('alarmDays');
      if (savedDays) setDays(JSON.parse(savedDays));

      const city = await AsyncStorage.getItem('fallbackCity');
      const photo = await fetchSunRisePhoto(city ?? 'sunrise');
      if (photo) setPhotoUrl(photo);

      };
    load();
  }, []);

  useEffect(() => {
    if (sunRise === "Loading...") return;
    setCountdown(getCountDown(sunRise));  // run immediately on load
    
    const interval = setInterval(() => {
      setCountdown(getCountDown(sunRise));
    }, 60000);

    return () => clearInterval(interval);
  }, [sunRise]);  // ← re-runs when sunRise changes from "Loading..." to real value

  // event hooks — these go alongside your other useEffects
  // update both state and ref when transcript changes
  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? '';
    console.log('Heard:', text);
    setTranscript(text);
    transcriptRef.current = text;  // ← always up to date
  });

  // use ref inside "end" handler
  useSpeechRecognitionEvent("end", async () => {
    setIsListening(false);
    if (!transcriptRef.current) return;  // ← use ref not state
    const newOffset = await parseAlarmCommand(transcriptRef.current);
    if (newOffset !== null) {
      setOffset(newOffset);
      await AsyncStorage.setItem('alarmOffset', JSON.stringify(newOffset));
      // auto schedule with new offset
      const granted = await requestPermission();
      if (granted) await scheduleAlarm(sunRise, newOffset, days);
      setIsEnabled(true);
      await AsyncStorage.setItem('alarmEnabled', JSON.stringify(true));
    }
  });

  const handlePress = async () => {
    if(isEnabled){
      await cancelAlarm();
    }
    else{
      const granted = await requestPermission();
      if (granted) await scheduleAlarm(sunRise, offset,days);
    }
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    await AsyncStorage.setItem('alarmEnabled', JSON.stringify(newValue));
  };

  // function to start listening
  const startListening = async () => {
    const granted = await requestMicPermission();
    if (!granted) return;
    setIsListening(true);
    setTranscript('');
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: false });
  };

  return (
    // your code here
    <ImageBackground source={photoUrl ? { uri: photoUrl } : undefined} style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/settings')}>
        <Text>⚙️ Settings</Text>
      </TouchableOpacity>
      <Text>🌅</Text>
      <Text> Sunrise alarm</Text>
      <Text> Next sunrise: {error ? "Failed to load" : sunRise}</Text>
      <Text>🌅 {countdown}</Text>
      <TouchableOpacity style={[styles.button, isEnabled ? styles.buttonActive : styles.buttonInActive]} onPress={handlePress}> 
        <Text style={styles.buttonText}>{isEnabled? 'Disable alarm' : 'Enable alarm'}</Text>
      </TouchableOpacity>
      <Text>{isEnabled? `Alarm set for ${sunRise}` : "No alarm set"}</Text>
      <TouchableOpacity
        style={[styles.micButton, isListening ? styles.micActive : styles.micInactive]}
        onPress={startListening}
      >
        <Text style={styles.micText}>{isListening ? '🎙️ Listening...' : '🎤'}</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // your styles here
  container:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button:{
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 10
  },
  buttonActive: {
    backgroundColor: '#2a9d5c',  // green = alarm is ON
  },
  buttonInActive: {
    backgroundColor: '#ff7b00',  // orange = alarm is OFF
  },
  buttonText:{
    color:'white',
    fontSize: 16
  },
  micButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micActive: { backgroundColor: '#e74c3c' },
  micInactive: { backgroundColor: '#ff7b00' },
  micText: { fontSize: 24 },
});