import * as Notifications from 'expo-notifications';
import { getAlarmTime } from './timeUtils';

export async function requestPermission(): Promise<boolean>{
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

export async function scheduleAlarm(time: string, offset: number){
    const [timePart, meridian] = time.split(" ");
    const [hourStr, minuteStr] = timePart.split(":");
    let hour = parseInt(hourStr);
    const minutes = parseInt(minuteStr);

    const adjustedTime = getAlarmTime(hour, minutes, offset);

    const [adjTimePart, adjMeridian] = adjustedTime.split(" ");
    const [adjHourStr, adjMinuteStr] = adjTimePart.split(":");
    let hour_updated = parseInt(adjHourStr);
    const minutes_updated = parseInt(adjMinuteStr);

    if (adjMeridian === "PM" && hour_updated !== 12) hour_updated+=12;
    if (adjMeridian === "AM" && hour_updated===12) hour_updated =0;


    const trigger = new Date();
    trigger.setHours(hour_updated);
    trigger.setMinutes(minutes_updated);
    trigger.setSeconds(0);

    if (trigger <= new Date()) {
        trigger.setDate(trigger.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "🌅 Good morning!",
            body: "Time to wake up with the sun",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: trigger,
        },
    });
}

export async function cancelAlarm(){
    await Notifications.cancelAllScheduledNotificationsAsync();
}