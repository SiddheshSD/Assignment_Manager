import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import NeumorphicCard from './NeumorphicCard';
import { clearAllData, loadNotificationTimes, saveNotificationTimes, loadNotificationSchedules, saveNotificationSchedules, loadNotificationEnabled, saveNotificationEnabled } from '../utils/storage';
import { requestNotificationPermissions, ensureAndroidChannel, scheduleDailyNotification, scheduleWeeklyNotification } from '../utils/notifications';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

const Header = ({ navigation, title, showBack }) => {
  const { mode, palette, setMode } = React.useContext(ThemeContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifTimes, setNotifTimes] = useState([]);
  const [notifDays, setNotifDays] = useState([true, true, true, true, true, false, false]);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const [timePickerIndex, setTimePickerIndex] = useState(null);
  const [timePickerDate, setTimePickerDate] = useState(new Date());

  const toggleTheme = async () => {
    const next = mode === 'light' ? 'dark' : 'light';
    await setMode(next);
    setMenuVisible(false);
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all assignments, experiments and test scores. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: async () => { await clearAllData(); setMenuVisible(false); } },
      ]
    );
  };

  useEffect(() => {
    (async () => {
      await ensureAndroidChannel();
      const savedTimes = await loadNotificationTimes();
      if (Array.isArray(savedTimes)) setNotifTimes(savedTimes);
      const savedDays = await loadNotificationSchedules();
      if (Array.isArray(savedDays) && savedDays.length === 7) setNotifDays(savedDays);
      const enabled = await loadNotificationEnabled();
      setNotifEnabled(enabled);
    })();
  }, []);

  const openNotifSettings = async () => {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      Alert.alert('Permission needed', 'Enable notifications to receive reminders.');
      return;
    }
    setNotifVisible(true);
  };

  const addNotifTime = () => {
    setNotifTimes([...(notifTimes || []), { hour: 18, minute: 0 }]);
  };

  const is24Hour = (() => {
    const str = new Date().toLocaleTimeString();
    return !/(am|pm)/i.test(str);
  })();

  const formatHour = (h) => {
    if (is24Hour) return String(h).padStart(2, '0');
    const hr12 = ((h % 12) || 12);
    return String(hr12).padStart(2, '0');
  };
  const formatAmPm = (h) => (h >= 12 ? 'PM' : 'AM');

  const openTimePicker = (index) => {
    const t = notifTimes[index] || { hour: 0, minute: 0 };
    const d = new Date();
    d.setHours(t.hour);
    d.setMinutes(t.minute);
    d.setSeconds(0);
    setTimePickerDate(d);
    setTimePickerIndex(index);
  };

  const onTimePicked = (_event, selectedDate) => {
    if (selectedDate) {
      const hour = selectedDate.getHours();
      const minute = selectedDate.getMinutes();
      setNotifTimes((prev) => prev.map((t, i) => (i === timePickerIndex ? { hour, minute } : t)));
    }
    setTimePickerIndex(null);
  };

  const toggleNotifications = async () => {
    const next = !notifEnabled;
    setNotifEnabled(next);
    await saveNotificationEnabled(next);
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (next) {
      // Reschedule with current times/days
      const weekdays = notifDays.map((on, i) => (on ? i + 1 : null)).filter(Boolean);
      const body = 'Check written assignments/experiments to review.';
      const tasks = [];
      for (const t of notifTimes || []) {
        if (weekdays.length === 7) tasks.push(scheduleDailyNotification(t, body));
        else weekdays.forEach((wd) => tasks.push(scheduleWeeklyNotification(t, wd, body)));
      }
      await Promise.all(tasks);
    }
  };

  const saveNotif = async () => {
    await saveNotificationTimes(notifTimes);
    await saveNotificationSchedules(notifDays);

    await Notifications.cancelAllScheduledNotificationsAsync();

    if (notifEnabled) {
      const weekdays = notifDays.map((on, i) => (on ? i + 1 : null)).filter(Boolean);
      const body = 'Check written assignments/experiments to review.';
      const tasks = [];
      for (const t of notifTimes || []) {
        if (weekdays.length === 7) tasks.push(scheduleDailyNotification(t, body));
        else weekdays.forEach((wd) => tasks.push(scheduleWeeklyNotification(t, wd, body)));
      }
      await Promise.all(tasks);
    }

    setNotifVisible(false);
    setMenuVisible(false);
  };

  const canGoBack = typeof showBack === 'boolean' ? showBack : (navigation?.canGoBack?.() || false);

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: palette.background }]}> 
      <View style={styles.leftGroup}>
        {canGoBack && (
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={palette.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={[styles.logoCircle, { backgroundColor: palette.surface }]}> 
          <Ionicons name="school" size={20} color={palette.accent} />
        </View>
        <Text style={[styles.appName, { color: palette.textPrimary }]}>ASS APP</Text>
        <Text style={[styles.headerTitle, { color: palette.textSecondary }]}> · {title}</Text>
      </View>

      <TouchableOpacity style={styles.iconButton} onPress={() => setMenuVisible(true)}>
        <Ionicons name="ellipsis-vertical" size={20} color={palette.textPrimary} />
      </TouchableOpacity>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View />
        </Pressable>
        <View style={[styles.menuContainer, { backgroundColor: palette.surface }]}> 
          <TouchableOpacity style={styles.menuItemRow} onPress={toggleTheme}>
            <Ionicons name="color-palette-outline" size={18} color={palette.textPrimary} />
            <Text style={[styles.menuText, { color: palette.textPrimary }]}>Switch to {mode === 'light' ? 'Dark' : 'Light'} Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItemRow} onPress={openNotifSettings}>
            <Ionicons name="notifications-outline" size={18} color={palette.textPrimary} />
            <Text style={[styles.menuText, { color: palette.textPrimary }]}>Notification Settings</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItemRow} onPress={handleClearData}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={[styles.menuText, { color: '#ef4444' }]}>Clear All App Data</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <View style={styles.copyrightRow}>
            <Text style={[styles.copyright, { color: palette.textSecondary }]}>© SiddheshSD</Text>
          </View>
        </View>
      </Modal>

      <Modal visible={notifVisible} transparent animationType="fade" onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.centerOverlay}>
          <View style={[styles.largeModal, { backgroundColor: palette.surface }]}> 
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Daily Reminder Times</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity onPress={toggleNotifications} style={[styles.iconButton, { backgroundColor: palette.background, marginRight: 0 }]}>
                  <Ionicons name={notifEnabled ? 'notifications' : 'notifications-off-outline'} size={18} color={palette.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleNotifications} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: palette.background }}>
                  <Text style={{ color: palette.textPrimary }}>{notifEnabled ? 'On' : 'Off'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {(notifTimes || []).map((t, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 12 }}>
                <TouchableOpacity onPress={() => openTimePicker(idx)} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: palette.background }}>
                  <Text style={{ color: palette.textPrimary }}>{`${formatHour(t.hour)}:${String(t.minute).padStart(2,'0')}${is24Hour ? '' : ' ' + formatAmPm(t.hour)}`}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setNotifTimes(notifTimes.filter((_, i) => i !== idx))} style={[styles.iconButton, { backgroundColor: palette.background, marginRight: 0 }]}>
                  <Ionicons name="trash-outline" size={18} color={palette.textPrimary} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4 }}>
              <TouchableOpacity onPress={addNotifTime} style={[styles.iconButton, { backgroundColor: palette.background, marginRight: 0 }]}>
                <Ionicons name="add" size={18} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.menuText, { color: palette.textPrimary, paddingHorizontal: 12, paddingVertical: 8 }]}>Days of Week</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingBottom: 8 }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                <TouchableOpacity key={d} onPress={() => setNotifDays(notifDays.map((v, idx) => (idx===i ? !v : v)))} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: notifDays[i] ? palette.accent : palette.background }}>
                  <Text style={{ color: notifDays[i] ? 'white' : palette.textPrimary }}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 12, gap: 10 }}>
              <TouchableOpacity onPress={() => setNotifVisible(false)} style={[styles.iconButton, { backgroundColor: palette.background, marginRight: 0 }]}>
                <Ionicons name="close" size={18} color={palette.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={saveNotif} style={[styles.iconButton, { backgroundColor: palette.background, marginRight: 0 }]}>
                <Ionicons name="checkmark" size={18} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {timePickerIndex !== null && (
        <DateTimePicker
          value={timePickerDate}
          mode="time"
          display="default"
          onChange={onTimePicked}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headerTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 12,
    width: 260,
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  largeModal: {
    width: '90%',
    maxWidth: 420,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#00000020',
    marginVertical: 2,
  },
  menuText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  copyrightRow: {
    alignItems: 'center',
    paddingTop: 6,
  },
  copyright: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
});

export default Header;


