import * as Location from 'expo-location';

export async function getCoordinates(): Promise<{ lat: number; lng: number } | null> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
    };
}

export async function getCityCoordinates(city:string): Promise<{ lat: number; lng: number } | null> {
    try{
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`);
        const data =await response.json();
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        return {
            lat, lng: lon
        };
    }
    catch(e){
        return null;
    }
}