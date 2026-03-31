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

export function getCountDown(sunriseTime: string): string{
    if (sunriseTime === "Loading...") return "Calculating...";

    const [timepart,meridian]=sunriseTime.split(" ");
    const [hourStr, minuteStr]=timepart.split(":");
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    if (meridian === "PM" && hour !== 12) hour+=12;
    if (meridian === "AM" && hour===12) hour =0;

    const now=new Date();
    const target=new Date();
    target.setHours(hour);
    target.setMinutes(minute);
    target.setSeconds(0);

    const diffMs = target.getTime() - now.getTime(); // difference in milliseconds
    const diffMins = Math.floor(diffMs/60000); // convert to minutes
    const remainingHours = Math.floor(diffMins/60);
    const remainingMins = diffMins%60;

    if (diffMs <= 0) return "Risen — next sunrise tomorrow";
    return `${remainingHours}h, ${remainingMins}m`;
}