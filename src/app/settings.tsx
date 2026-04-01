import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Settings(){
    const [city,setCity] = useState<string>('');

    const [offset, setOffset] = useState<number>(0);

    const [selectedDays,setSelectedDays] = useState<number[]>([]);

    useEffect(()=>{
        const load = async () =>{
            const savedCity = await AsyncStorage.getItem('fallbackCity');
            const savedOffset = await AsyncStorage.getItem('alarmOffset');
            const savedDays = await AsyncStorage.getItem('alarmDays');
            if(savedCity) setCity(savedCity);
            if(savedOffset) setOffset(JSON.parse(savedOffset));
            if(savedDays) setSelectedDays(JSON.parse(savedDays));
        }
        load();
    }, []);

    const handleSave = async () => {
        // read previous city BEFORE overwriting it
        const previousCity = await AsyncStorage.getItem('fallbackCity');
        if (city !== previousCity) {
          await AsyncStorage.removeItem('cachedSunrise');
          await AsyncStorage.removeItem('cachedSunriseDate');
        }
        await AsyncStorage.setItem('fallbackCity', city);
        await AsyncStorage.setItem('alarmOffset', JSON.stringify(offset));
        await AsyncStorage.setItem('alarmDays', JSON.stringify(selectedDays));
        router.back();
    }

    const getOffsetLabel = (offset: number) =>{
        if(offset===0) return "At sunrise";
        if(offset<0) return `${Math.abs(offset)} minutes before sunrise`;
        return `${offset} minutes after sunrise`;
    }

    const toggleDay = (day: number) => {
        if (selectedDays.includes(day)) {
        // remove it
        setSelectedDays(selectedDays.filter(d => d !== day)); //Keep (true) the element d if it does not match the day that should be removed.
        } else {
        // add it
        setSelectedDays([...selectedDays, day]);
        }
    };

    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

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
            {
                days.map((day, index) =>(
                    <TouchableOpacity key={index} onPress={() => toggleDay(index)} style={selectedDays.includes(index) ? styles.daySelected : styles.dayUnselected}>
                        <Text>{day}</Text>
                    </TouchableOpacity>
                ))
            }
            <TouchableOpacity onPress={handleSave}>
                <Text>Save</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles= StyleSheet.create({
    daySelected: { backgroundColor: '#ff7b00', padding: 8, borderRadius: 20 },
    dayUnselected: { backgroundColor: '#ccc', padding: 8, borderRadius: 20 },
})