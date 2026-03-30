import { getAlarmTime } from "./timeUtils";

export async function fetchSunriseTime(latitude: number, longitude: number): Promise<string | null>{
      //const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      
      try{
        const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`);
        const data = await response.json();
        const date = new Date(data.results.sunrise);
        const hour = ( date.getUTCHours()+ 8 )% 24;
        const minutes = date.getUTCMinutes();
        return getAlarmTime(hour, minutes, 0);
      }
      catch (e){
        return null;
      }
      
}