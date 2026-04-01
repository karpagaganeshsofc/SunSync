import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

export async function requestMicPermission(): Promise<boolean> {
  const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  return result.granted;
}