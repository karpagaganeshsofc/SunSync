import * as Notifications from 'expo-notifications';

export async function requestPermission(): Promise<boolean>{
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

export async function scheduleAlarm(time: string){
    const [timePart, meridian] = time.split(" ");
    const [hourStr, minuteStr] = timePart.split(":");
    let hour = parseInt(hourStr);
    const minutes = parseInt(minuteStr);

    if (meridian === "PM" && hour !== 12) hour+=12;
    if (meridian === "AM" && hour===12) hour =0;

    const trigger = new Date();
    trigger.setHours(hour);
    trigger.setMinutes(minutes);
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