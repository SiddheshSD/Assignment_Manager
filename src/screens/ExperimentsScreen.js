import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import NeumorphicCard from '../components/NeumorphicCard';
import { ThemeContext } from '../utils/theme';
import NeumorphicButton from '../components/NeumorphicButton';
import NeumorphicInput from '../components/NeumorphicInput';
import { saveExperiments, loadExperiments, loadAssignments, loadNotificationTimes, loadNotificationSchedules, loadNotificationEnabled } from '../utils/storage';
import { scheduleWrittenItemsNotification, scheduleSubmissionReminders } from '../utils/notifications';

const ExperimentsScreen = ({ navigation }) => {
  const [experiments, setExperiments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [totalExperiments, setTotalExperiments] = useState('');
  const [courseCode, setCourseCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );
  const loadData = async () => {
    const data = await loadExperiments();
    setExperiments(data);
  };

  const saveData = async (newExperiments) => {
    await saveExperiments(newExperiments);
    setExperiments(newExperiments);
    
    // Reschedule notifications after data changes
    const enabled = await loadNotificationEnabled();
    if (enabled) {
      const times = await loadNotificationTimes();
      const days = await loadNotificationSchedules();
      const assignments = await loadAssignments();
      
      await scheduleWrittenItemsNotification(times, days);
      await scheduleSubmissionReminders(assignments, newExperiments);
    }
  };

  const handleAddSubject = () => {
    if (!subjectName.trim() || !totalExperiments.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const total = parseInt(totalExperiments);
    if (isNaN(total) || total <= 0) {
      Alert.alert('Error', 'Please enter a valid number of experiments');
      return;
    }

    const newExperiment = {
      id: Date.now().toString(),
      subjectName: subjectName.trim(),
      courseCode: courseCode.trim(),
      totalExperiments: total,
      experiments: Array.from({ length: total }, (_, i) => ({
        id: i + 1,
        name: `Experiment ${i + 1}`,
        status: 'not_given', // not_given, not_completed, written, completed
      })),
    };

    const newExperiments = [...experiments, newExperiment];
    saveData(newExperiments);

    setSubjectName('');
    setTotalExperiments('');
    setCourseCode('');
    setShowAddForm(false);
  };

  const getStatusCounts = (experiment) => {
    const counts = {
      completed: 0,
      written: 0,
      not_completed: 0,
      not_given: 0,
    };

    experiment.experiments.forEach((item) => {
      counts[item.status]++;
    });

    return counts;
  };

  const getStatusNumbers = (experiment, status) => {
    const items = experiment.experiments
      .filter((item) => item.status === status)
      .map((item) => item.id);
    return items.length > 0 ? items.join(', ') : 'None';
  };

  const getProgressPercentage = (item) => {
    const completed = getStatusCounts(item).completed;
    return Math.round((completed / item.totalExperiments) * 100) || 0;
  };

  const renderExperimentCard = ({ item }) => {
    const counts = getStatusCounts(item);
    const completedNumbers = getStatusNumbers(item, 'completed');
    const writtenNumbers = getStatusNumbers(item, 'written');
    const notCompletedNumbers = getStatusNumbers(item, 'not_completed');
    const notGivenNumbers = getStatusNumbers(item, 'not_given');
    const progressPercentage = getProgressPercentage(item);

    return (
      <NeumorphicCard
        onPress={() => navigation.navigate('ExperimentDetail', { experiment: item })}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerTopRow}>
            <View style={styles.titleContainer}>
              <Text style={[styles.subjectName, { color: palette.textPrimary }]}>{item.subjectName}</Text>
              {!!item.courseCode && (
                <Text style={[styles.courseCode, { color: palette.textSecondary }]}>{item.courseCode}</Text>
              )}
            </View>
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: progressPercentage >= 70 ? '#10b981' : progressPercentage >= 40 ? '#f59e0b' : '#ef4444' }]}>
                {progressPercentage}%
              </Text>
              <View style={[styles.progressBar, { backgroundColor: palette.surface }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progressPercentage}%`,
                      backgroundColor: progressPercentage >= 70 ? '#10b981' : progressPercentage >= 40 ? '#f59e0b' : '#ef4444'
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
          <Text style={[styles.totalText, { color: palette.textSecondary }]}>Total: {item.totalExperiments} experiments</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={styles.statusSection}>
            <View style={styles.statusRow}>
              <View style={[styles.statusIcon, { backgroundColor: '#10b981' }]}>
                <Ionicons name="checkmark-circle" size={14} color="white" />
              </View>
              <Text style={[styles.statusLabel, { color: '#10b981' }]}>Done:</Text>
              <Text style={[styles.statusNumbers, { color: palette.textPrimary }]}>{completedNumbers}</Text>
            </View>
            
            <View style={styles.statusRow}>
              <View style={[styles.statusIcon, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="create" size={14} color="white" />
              </View>
              <Text style={[styles.statusLabel, { color: '#f59e0b' }]}>Written:</Text>
              <Text style={[styles.statusNumbers, { color: palette.textPrimary }]}>{writtenNumbers}</Text>
            </View>
            
            <View style={styles.statusRow}>
              <View style={[styles.statusIcon, { backgroundColor: '#ef4444' }]}>
                <Ionicons name="close-circle" size={14} color="white" />
              </View>
              <Text style={[styles.statusLabel, { color: '#ef4444' }]}>Pending:</Text>
              <Text style={[styles.statusNumbers, { color: palette.textPrimary }]}>{notCompletedNumbers}</Text>
            </View>
            
            <View style={styles.statusRow}>
              <View style={[styles.statusIcon, { backgroundColor: '#6b7280' }]}>
                <Ionicons name="ellipse-outline" size={14} color="white" />
              </View>
              <Text style={[styles.statusLabel, { color: '#6b7280' }]}>Not Given:</Text>
              <Text style={[styles.statusNumbers, { color: palette.textPrimary }]}>{notGivenNumbers}</Text>
            </View>
          </View>
        </View>
      </NeumorphicCard>
    );
  };

  const renderAddForm = () => {
    if (!showAddForm) return null;

    return (
      <NeumorphicCard style={styles.addForm}>
        <Text style={[styles.formTitle, { color: palette.textPrimary }]}>Add New Subject</Text>
        <NeumorphicInput
          placeholder="Subject Name"
          value={subjectName}
          onChangeText={setSubjectName}
          style={styles.input}
        />
        <NeumorphicInput
          placeholder="Number of Experiments"
          value={totalExperiments}
          onChangeText={setTotalExperiments}
          keyboardType="numeric"
          style={styles.input}
        />
        <NeumorphicInput
          placeholder="Course Code (optional)"
          value={courseCode}
          onChangeText={setCourseCode}
          style={styles.input}
        />
        <View style={styles.buttonContainer}>
          <NeumorphicButton
            title="Cancel"
            onPress={() => {
              setShowAddForm(false);
              setSubjectName('');
              setTotalExperiments('');
            }}
            style={[styles.button, styles.cancelButton]}
            textStyle={styles.cancelButtonText}
          />
          <NeumorphicButton
            title="Add Subject"
            onPress={handleAddSubject}
            style={[styles.button, styles.cancelButton]}
            textStyle={styles.cancelButtonText}
          />
        </View>
      </NeumorphicCard>
    );
  };

  const palette = React.useContext(ThemeContext).palette;
  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}> 
      <View style={[styles.header, { backgroundColor: palette.background }]}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Experiments</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: palette.surface }]}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Ionicons name="add" size={24} color={palette.textPrimary} />
        </TouchableOpacity>
      </View>

      {renderAddForm()}

      <FlatList
        data={experiments}
        renderItem={renderExperimentCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6e6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#e6e6e6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
     shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
  },
  cardHeader: {
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  subjectName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  courseCode: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  progressContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    width: 60,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  totalText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statusContainer: {
    marginTop: 4,
  },
  statusSection: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 50,
  },
  statusNumbers: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  addForm: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#f0f0f3',
  },
  cancelButtonText: {
    color: '#ef4444',
  },
});

export default ExperimentsScreen;



