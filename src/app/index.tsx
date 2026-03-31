import { getCityCoordinates, getCoordinates } from '@/utils/locationUtils';
import { cancelAlarm, requestPermission, scheduleAlarm } from '@/utils/notificationUtils';
import { fetchSunriseTime } from '@/utils/sunriseUtils';
import { getCountDown } from '@/utils/timeUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [sunRise, setSunRise] = useState<string>("Loading...");
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();
  const [offset, setOffset]= useState<number>(0);
  const [countdown, setCountdown] = useState<string>("Calculating...");


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

  const handlePress = async () => {
    if(isEnabled){
      await cancelAlarm();
    }
    else{
      const granted = await requestPermission();
      if (granted) await scheduleAlarm(sunRise, offset);
    }
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    await AsyncStorage.setItem('alarmEnabled', JSON.stringify(newValue));
  };

  return (
    // your code here
    <View style={styles.container}>
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
    </View>
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
  }
});
