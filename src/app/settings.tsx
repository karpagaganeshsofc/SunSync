import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Settings(){
    const [city,setCity] = useState<string>('');

    const handleSave = async () => {
        await AsyncStorage.setItem('fallbackCity', city);
        router.back();
    }

    return(
        <View>
            <TextInput
                value={city} onChangeText={setCity} placeholder="Enter your city name"
            />
            <TouchableOpacity onPress={handleSave}>
                <Text>Save</Text>
            </TouchableOpacity>
        </View>
    );
}