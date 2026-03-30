export function getAlarmTime(sunriseHour: number, sunriseMinute: number, offsetMinutes: number){
    let total_minutes = ((sunriseHour*60 + sunriseMinute - offsetMinutes)+1440)%1440;
    
    let hour = Math.floor(total_minutes / 60);
    let minute = total_minutes % 60;
    
    let meridian = "AM";
    if (hour>=12){
        meridian = "PM";
    }
    
    if (hour===0) hour = 12;
    if (hour>12) hour = hour - 12;
    let minuteStr = minute < 10 ? "0" + minute : minute.toString();
    let result = hour + ":" + minuteStr + " " + meridian;
    return result;
}