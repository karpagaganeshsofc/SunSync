import { getCityCoordinates, getCoordinates } from '@/utils/locationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Onboarding() {
  const [city, setCity] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSavingCity, setIsSavingCity] = useState(false);
  const [error, setError] = useState('');

  const handleUseLocation = async () => {
    setError('');
    setIsLocating(true);
    const coords = await getCoordinates();
    setIsLocating(false);
    if (coords) {
      await AsyncStorage.setItem('hasLaunched', 'true');
      router.replace('/');
    } else {
      setError('Location permission denied. Enter your city below instead.');
    }
  };

  const handleUseCity = async () => {
    if (!city.trim()) return;
    setError('');
    setIsSavingCity(true);
    const coords = await getCityCoordinates(city.trim());
    setIsSavingCity(false);
    if (coords) {
      await AsyncStorage.setItem('fallbackCity', city.trim());
      await AsyncStorage.setItem('hasLaunched', 'true');
      router.replace('/');
    } else {
      setError('City not found. Try a different spelling.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.emoji}>🌅</Text>
      <Text style={styles.title}>SunSync</Text>
      <Text style={styles.subtitle}>Wake up with the sun, every day.</Text>

      {/* Location option */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Use your location</Text>
        <Text style={styles.cardDesc}>Most accurate — updates automatically every day.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={handleUseLocation} disabled={isLocating}>
          {isLocating
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryButtonText}>Allow Location</Text>
          }
        </TouchableOpacity>
      </View>

      <Text style={styles.orText}>— or —</Text>

      {/* City option */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Enter your city</Text>
        <Text style={styles.cardDesc}>You can always change this in Settings later.</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Chennai, Tokyo, New York"
          placeholderTextColor="#666"
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleUseCity}
        />
        <TouchableOpacity
          style={[styles.secondaryButton, (!city.trim() || isSavingCity) && styles.buttonDisabled]}
          onPress={handleUseCity}
          disabled={isSavingCity || !city.trim()}
        >
          {isSavingCity
            ? <ActivityIndicator color="#ff7b00" />
            : <Text style={styles.secondaryButtonText}>Continue</Text>
          }
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 40 },
  card: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#888', marginBottom: 16 },
  primaryButton: {
    backgroundColor: '#ff7b00',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: '#ff7b00',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.4 },
  secondaryButtonText: { color: '#ff7b00', fontWeight: '600', fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    backgroundColor: '#0d0d1a',
    fontSize: 15,
  },
  orText: { color: '#555', fontSize: 14, marginVertical: 12 },
  error: { color: '#e74c3c', marginTop: 16, textAlign: 'center', fontSize: 14 },
});
