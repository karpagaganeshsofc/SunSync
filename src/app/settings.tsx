import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Settings(){
    const [city,setCity] = useState<string>('');

    const [offset, setOffset] = useState<number>(0);

    useEffect(()=>{
        const load = async () =>{
            const savedCity = await AsyncStorage.getItem('fallbackCity');
            const savedOffset = await AsyncStorage.getItem('alarmOffset');
            if(savedCity) setCity(savedCity);
            if(savedOffset) setOffset(JSON.parse(savedOffset));
        }
        load();
    }, []);

    const handleSave = async () => {
        await AsyncStorage.setItem('fallbackCity', city);
        await AsyncStorage.setItem('alarmOffset', JSON.stringify(offset));
        router.back();
    }

    const getOffsetLabel = (offset: number) =>{
        if(offset===0) return "At sunrise";
        if(offset<0) return `${Math.abs(offset)} minutes before sunrise`;
        return `${offset} minutes after sunrise`;
    }

    return(
        <View>
            <Text>Select wake up time before or after sunrise</Text>
            <Text>{getOffsetLabel(offset)}</Text>
            <Slider
                minimumValue={-60} maximumValue={60} step={5} value={offset} onValueChange={setOffset}
            />
            <TextInput
                value={city} onChangeText={setCity} placeholder="Enter your city name"
            />
            <TouchableOpacity onPress={handleSave}>
                <Text>Save</Text>
            </TouchableOpacity>
        </View>
    );
}