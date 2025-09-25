import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const req = await Notifications.requestPermissionsAsync();
  return req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function scheduleDailyNotification(time, body) {
  // time: { hour: number, minute: number }
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ASS APP',
      body,
      sound: true,
    },
    trigger: {
      hour: time.hour,
      minute: time.minute,
      repeats: true,
      channelId: Platform.OS === 'android' ? 'assapp-default' : undefined,
    },
  });
}

export async function scheduleWeeklyNotification(time, weekday, body) {
  // weekday: 1..7 (1=Sunday on iOS; Expo uses 1-7)
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ASS APP',
      body,
      sound: true,
    },
    trigger: {
      hour: time.hour,
      minute: time.minute,
      weekday,
      repeats: true,
      channelId: Platform.OS === 'android' ? 'assapp-default' : undefined,
    },
  });
}

export async function scheduleAt(date, body) {
  // date: JS Date instance in local time
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ASS APP',
      body,
      sound: true,
    },
    trigger: {
      date,
      channelId: Platform.OS === 'android' ? 'assapp-default' : undefined,
    },
  });
}

export async function cancelNotification(id) {
  try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('assapp-default', {
    name: 'ASS APP',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}




