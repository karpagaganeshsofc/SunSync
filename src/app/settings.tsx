import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Settings(){
    const [city, setCity] = useState<string>('');
    const [offset, setOffset] = useState<number>(0);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    const [offsetSaved, setOffsetSaved] = useState(false);
    const [citySaved, setCitySaved] = useState(false);
    const [daysSaved, setDaysSaved] = useState(false);

    useEffect(()=>{
        const load = async () =>{
            const [savedCity, savedOffset, savedDays] = await Promise.all([
                AsyncStorage.getItem('fallbackCity'),
                AsyncStorage.getItem('alarmOffset'),
                AsyncStorage.getItem('alarmDays'),
            ]);
            if(savedCity) setCity(savedCity);
            if(savedOffset) setOffset(JSON.parse(savedOffset));
            if(savedDays) setSelectedDays(JSON.parse(savedDays));
        }
        load();
    }, []);

    const saveOffset = async () => {
        await AsyncStorage.setItem('alarmOffset', JSON.stringify(offset));
        setOffsetSaved(true);
        setTimeout(() => setOffsetSaved(false), 2000);
    };

    const saveCity = async () => {
        const previousCity = await AsyncStorage.getItem('fallbackCity');
        if (city.trim() !== previousCity) {
            await AsyncStorage.removeItem('cachedSunrise');
            await AsyncStorage.removeItem('cachedSunriseDate');
        }
        await AsyncStorage.setItem('fallbackCity', city.trim());
        setCitySaved(true);
        setTimeout(() => setCitySaved(false), 2000);
    };

    const saveDays = async () => {
        await AsyncStorage.setItem('alarmDays', JSON.stringify(selectedDays));
        setDaysSaved(true);
        setTimeout(() => setDaysSaved(false), 2000);
    };

    const getOffsetLabel = (offset: number) =>{
        if(offset===0) return "At sunrise";
        if(offset<0) return `${Math.abs(offset)} min before sunrise`;
        return `${offset} min after sunrise`;
    }

    const toggleDay = (day: number) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    return(
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Section 1: Alarm Time */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Alarm Time</Text>
                    <Text style={styles.offsetLabel}>{getOffsetLabel(offset)}</Text>
                    <Slider
                        minimumValue={-60}
                        maximumValue={60}
                        step={5}
                        value={offset}
                        onValueChange={setOffset}
                        minimumTrackTintColor="#ff7b00"
                        maximumTrackTintColor="#333"
                        thumbTintColor="#ff7b00"
                        style={styles.slider}
                    />
                    <View style={styles.sliderLabels}>
                        <Text style={styles.sliderEdge}>-60m</Text>
                        <Text style={styles.sliderEdge}>+60m</Text>
                    </View>
                    <TouchableOpacity style={[styles.saveButton, offsetSaved && styles.saveButtonDone]} onPress={saveOffset}>
                        <Text style={styles.saveButtonText}>{offsetSaved ? '✓ Saved' : 'Save'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Section 2: Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <Text style={styles.sectionDesc}>Used to find the sunrise time for your area.</Text>
                    <TextInput
                        style={styles.input}
                        value={city}
                        onChangeText={setCity}
                        placeholder="e.g. Chennai, Tokyo, New York"
                        placeholderTextColor="#666"
                        autoCapitalize="words"
                        returnKeyType="done"
                    />
                    <TouchableOpacity style={[styles.saveButton, citySaved && styles.saveButtonDone]} onPress={saveCity}>
                        <Text style={styles.saveButtonText}>{citySaved ? '✓ Saved' : 'Save'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Section 3: Repeat Days */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Repeat Days</Text>
                    <Text style={styles.sectionDesc}>Leave empty for a one-time alarm tomorrow.</Text>
                    <View style={styles.daysRow}>
                        {days.map((day, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => toggleDay(index)}
                                style={[styles.dayButton, selectedDays.includes(index) && styles.daySelected]}
                            >
                                <Text style={[styles.dayText, selectedDays.includes(index) && styles.dayTextSelected]}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={[styles.saveButton, daysSaved && styles.saveButtonDone]} onPress={saveDays}>
                        <Text style={styles.saveButtonText}>{daysSaved ? '✓ Saved' : 'Save'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a1a' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a2e',
    },
    backButton: { width: 70 },
    backText: { color: '#ff7b00', fontSize: 16 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
    scroll: { padding: 20, gap: 16 },
    section: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
    },
    sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 4 },
    sectionDesc: { color: '#888', fontSize: 13, marginBottom: 14 },
    offsetLabel: { color: '#ff7b00', fontSize: 15, fontWeight: '500', marginBottom: 8, textAlign: 'center' },
    slider: { width: '100%' },
    sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    sliderEdge: { color: '#555', fontSize: 12 },
    input: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        backgroundColor: '#0d0d1a',
        fontSize: 15,
        marginBottom: 16,
    },
    daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    dayButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#0d0d1a',
        borderWidth: 1,
        borderColor: '#333',
    },
    daySelected: { backgroundColor: '#ff7b00', borderColor: '#ff7b00' },
    dayText: { color: '#888', fontSize: 13, fontWeight: '500' },
    dayTextSelected: { color: '#fff' },
    saveButton: {
        backgroundColor: '#ff7b00',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonDone: { backgroundColor: '#2a9d5c' },
    saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
