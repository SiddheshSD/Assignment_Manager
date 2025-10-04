import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import NeumorphicCard from './NeumorphicCard';
import { clearAllData, loadNotificationTimes, saveNotificationTimes, loadNotificationSchedules, saveNotificationSchedules, loadNotificationEnabled, saveNotificationEnabled, loadAssignments, loadExperiments } from '../utils/storage';
import { requestNotificationPermissions, ensureAndroidChannel, scheduleDailyNotification, scheduleWeeklyNotification, scheduleWrittenItemsNotification, scheduleSubmissionReminders, checkAndNotifyWrittenItems } from '../utils/notifications';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

const Header = ({ navigation, title, showBack }) => {
  const { mode, palette, setMode } = React.useContext(ThemeContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifTimes, setNotifTimes] = useState([]);
  const [notifDays, setNotifDays] = useState([true, true, true, true, true, false, false]);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [writtenItemsCount, setWrittenItemsCount] = useState(0);

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
      
      // Check written items count
      const assignments = await loadAssignments();
      const experiments = await loadExperiments();
      const { count } = await checkAndNotifyWrittenItems(assignments, experiments);
      setWrittenItemsCount(count);
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
      // Schedule written items notifications
      await scheduleWrittenItemsNotification(notifTimes, notifDays);
      
      // Schedule submission reminders
      const assignments = await loadAssignments();
      const experiments = await loadExperiments();
      await scheduleSubmissionReminders(assignments, experiments);
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
        <Text style={[styles.appName, { color: palette.textPrimary }]}>AssignHub</Text>
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
          <TouchableOpacity style={styles.githubRow} onPress={() => {
            // You can add GitHub link functionality here if needed
            // Linking.openURL('https://github.com/SiddheshSD');
          }}>
            <Ionicons name="logo-github" size={18} color={palette.textSecondary} />
            <Text style={[styles.githubText, { color: palette.textSecondary }]}>SiddheshSD</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={notifVisible} transparent animationType="fade" onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.centerOverlay}>
          <View style={[styles.largeModal, { backgroundColor: palette.surface }]}> 
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons name="notifications" size={24} color={palette.accent} />
                <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Notification Settings</Text>
              </View>
              <View style={styles.toggleContainer}>
                <TouchableOpacity onPress={toggleNotifications} style={[styles.toggleButton, { backgroundColor: notifEnabled ? palette.accent : palette.background }]}>
                  <Ionicons name={notifEnabled ? 'notifications' : 'notifications-off-outline'} size={18} color={notifEnabled ? 'white' : palette.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.toggleText, { color: palette.textPrimary }]}>{notifEnabled ? 'Enabled' : 'Disabled'}</Text>
              </View>
            </View>

            {/* Status Card */}
            <View style={[styles.statusCard, { backgroundColor: palette.background }]}>
              <View style={styles.statusRow}>
                <Ionicons name="create" size={20} color="#f59e0b" />
                <Text style={[styles.statusText, { color: palette.textPrimary }]}>Written Items: {writtenItemsCount}</Text>
              </View>
              <Text style={[styles.statusSubtext, { color: palette.textSecondary }]}>Items ready for review</Text>
            </View>

            {/* Reminder Times Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Daily Reminder Times</Text>
              <Text style={[styles.sectionSubtitle, { color: palette.textSecondary }]}>When to notify about written items</Text>
            </View>

            <View style={styles.timesContainer}>
              {(notifTimes || []).map((t, idx) => (
                <View key={idx} style={[styles.timeItem, { backgroundColor: palette.background }]}>
                  <TouchableOpacity onPress={() => openTimePicker(idx)} style={styles.timeButton}>
                    <Ionicons name="time-outline" size={18} color={palette.accent} />
                    <Text style={[styles.timeText, { color: palette.textPrimary }]}>
                      {`${formatHour(t.hour)}:${String(t.minute).padStart(2,'0')}${is24Hour ? '' : ' ' + formatAmPm(t.hour)}`}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setNotifTimes(notifTimes.filter((_, i) => i !== idx))} style={[styles.deleteTimeButton, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={addNotifTime} style={[styles.addTimeButton, { backgroundColor: palette.accent }]}>
                <Ionicons name="add" size={18} color="white" />
                <Text style={styles.addTimeText}>Add Time</Text>
              </TouchableOpacity>
            </View>

            {/* Days of Week Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Active Days</Text>
              <Text style={[styles.sectionSubtitle, { color: palette.textSecondary }]}>Select days to receive notifications</Text>
            </View>
            
            <View style={styles.daysContainer}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                <TouchableOpacity 
                  key={d} 
                  onPress={() => setNotifDays(notifDays.map((v, idx) => (idx===i ? !v : v)))} 
                  style={[styles.dayButton, { 
                    backgroundColor: notifDays[i] ? palette.accent : palette.background,
                    borderColor: notifDays[i] ? palette.accent : '#e5e7eb'
                  }]}
                >
                  <Text style={[styles.dayText, { color: notifDays[i] ? 'white' : palette.textPrimary }]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => setNotifVisible(false)} style={[styles.cancelButton, { backgroundColor: palette.background }]}>
                <Ionicons name="close" size={18} color={palette.textPrimary} />
                <Text style={[styles.buttonText, { color: palette.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveNotif} style={[styles.saveButton, { backgroundColor: palette.accent }]}>
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={[styles.buttonText, { color: 'white' }]}>Save Settings</Text>
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
  githubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  githubText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  // Enhanced notification modal styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusSubtext: {
    fontSize: 13,
    marginLeft: 30,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  timesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteTimeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addTimeText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    minWidth: 0,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Header;


