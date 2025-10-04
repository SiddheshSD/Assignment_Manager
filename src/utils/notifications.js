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
      title: 'AssignHub',
      body,
      sound: true,
    },
    trigger: {
      hour: time.hour,
      minute: time.minute,
      repeats: true,
      channelId: Platform.OS === 'android' ? 'assignhub-default' : undefined,
    },
  });
}

export async function scheduleWeeklyNotification(time, weekday, body) {
  // weekday: 1..7 (1=Sunday on iOS; Expo uses 1-7)
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'AssignHub',
      body,
      sound: true,
    },
    trigger: {
      hour: time.hour,
      minute: time.minute,
      weekday,
      repeats: true,
      channelId: Platform.OS === 'android' ? 'assignhub-default' : undefined,
    },
  });
}

export async function scheduleAt(date, body, title = 'AssignHub') {
  // date: JS Date instance in local time
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      date,
      channelId: Platform.OS === 'android' ? 'assignhub-default' : undefined,
    },
  });
}

export async function cancelNotification(id) {
  try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('assignhub-default', {
    name: 'AssignHub',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

// Enhanced notification functions for AssignHub
export async function scheduleWrittenItemsNotification(times, days) {
  // Cancel existing written items notifications
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const writtenNotifications = scheduledNotifications.filter(n => 
    n.content.body && n.content.body.includes('written assignments/experiments')
  );
  
  for (const notif of writtenNotifications) {
    await cancelNotification(notif.identifier);
  }

  // Schedule new notifications
  const weekdays = days.map((on, i) => (on ? i + 1 : null)).filter(Boolean);
  const body = 'You have written assignments/experiments to review!';
  
  const tasks = [];
  for (const time of times || []) {
    if (weekdays.length === 7) {
      tasks.push(scheduleDailyNotification(time, body));
    } else {
      weekdays.forEach((wd) => tasks.push(scheduleWeeklyNotification(time, wd, body)));
    }
  }
  
  return await Promise.all(tasks);
}

export async function scheduleSubmissionReminders(assignments, experiments) {
  // Cancel existing submission reminders
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const submissionNotifications = scheduledNotifications.filter(n => 
    n.content.body && (n.content.body.includes('due') || n.content.body.includes('submission'))
  );
  
  for (const notif of submissionNotifications) {
    await cancelNotification(notif.identifier);
  }

  const today = new Date();
  const tasks = [];

  // Process assignments
  for (const assignment of assignments || []) {
    for (const item of assignment.assignments || []) {
      if (item.submissionDate && (item.status === 'written' || item.status === 'not_completed')) {
        const submissionDate = new Date(item.submissionDate);
        
        // Only schedule if submission date is in the future
        if (submissionDate > today) {
          const subjectName = assignment.subjectName;
          
          // 2 days before
          const twoDaysBefore = new Date(submissionDate);
          twoDaysBefore.setDate(submissionDate.getDate() - 2);
          twoDaysBefore.setHours(9, 0, 0, 0); // 9 AM
          
          if (twoDaysBefore > today) {
            tasks.push(scheduleAt(
              twoDaysBefore, 
              `${subjectName} assignment due in 2 days!`,
              'Assignment Reminder'
            ));
          }

          // 1 day before
          const oneDayBefore = new Date(submissionDate);
          oneDayBefore.setDate(submissionDate.getDate() - 1);
          oneDayBefore.setHours(18, 0, 0, 0); // 6 PM
          
          if (oneDayBefore > today) {
            tasks.push(scheduleAt(
              oneDayBefore, 
              `${subjectName} assignment due tomorrow!`,
              'Assignment Reminder'
            ));
          }

          // Same day
          const sameDay = new Date(submissionDate);
          sameDay.setHours(8, 0, 0, 0); // 8 AM
          
          if (sameDay > today) {
            tasks.push(scheduleAt(
              sameDay, 
              `${subjectName} assignment due today!`,
              'Assignment Due Today'
            ));
          }
        }
      }
    }
  }

  // Process experiments
  for (const experiment of experiments || []) {
    for (const item of experiment.experiments || []) {
      if (item.submissionDate && (item.status === 'written' || item.status === 'not_completed')) {
        const submissionDate = new Date(item.submissionDate);
        
        // Only schedule if submission date is in the future
        if (submissionDate > today) {
          const subjectName = experiment.subjectName;
          
          // 2 days before
          const twoDaysBefore = new Date(submissionDate);
          twoDaysBefore.setDate(submissionDate.getDate() - 2);
          twoDaysBefore.setHours(9, 0, 0, 0); // 9 AM
          
          if (twoDaysBefore > today) {
            tasks.push(scheduleAt(
              twoDaysBefore, 
              `${subjectName} experiment due in 2 days!`,
              'Experiment Reminder'
            ));
          }

          // 1 day before
          const oneDayBefore = new Date(submissionDate);
          oneDayBefore.setDate(submissionDate.getDate() - 1);
          oneDayBefore.setHours(18, 0, 0, 0); // 6 PM
          
          if (oneDayBefore > today) {
            tasks.push(scheduleAt(
              oneDayBefore, 
              `${subjectName} experiment due tomorrow!`,
              'Experiment Reminder'
            ));
          }

          // Same day
          const sameDay = new Date(submissionDate);
          sameDay.setHours(8, 0, 0, 0); // 8 AM
          
          if (sameDay > today) {
            tasks.push(scheduleAt(
              sameDay, 
              `${subjectName} experiment due today!`,
              'Experiment Due Today'
            ));
          }
        }
      }
    }
  }

  return await Promise.all(tasks);
}

export async function checkAndNotifyWrittenItems(assignments, experiments) {
  let writtenCount = 0;
  const writtenItems = [];

  // Count written assignments
  for (const assignment of assignments || []) {
    for (const item of assignment.assignments || []) {
      if (item.status === 'written') {
        writtenCount++;
        writtenItems.push(`${assignment.subjectName} assignment`);
      }
    }
  }

  // Count written experiments
  for (const experiment of experiments || []) {
    for (const item of experiment.experiments || []) {
      if (item.status === 'written') {
        writtenCount++;
        writtenItems.push(`${experiment.subjectName} experiment`);
      }
    }
  }

  return { count: writtenCount, items: writtenItems };
}




