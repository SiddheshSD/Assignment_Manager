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
import { saveExperiments, loadExperiments } from '../utils/storage';

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
    return experiment.experiments
      .filter((item) => item.status === status)
      .map((item) => item.id)
      .join(', ');
  };

  const renderExperimentCard = ({ item }) => {
    const counts = getStatusCounts(item);
    const completedNumbers = getStatusNumbers(item, 'completed');
    const writtenNumbers = getStatusNumbers(item, 'written');
    const notCompletedNumbers = getStatusNumbers(item, 'not_completed');
    const notGivenNumbers = getStatusNumbers(item, 'not_given');

    return (
      <NeumorphicCard
        onPress={() => navigation.navigate('ExperimentDetail', { experiment: item })}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerTopRow}>
            <Text style={[styles.subjectName, { color: palette.textPrimary }]}>{item.subjectName}</Text>
            {!!item.courseCode && (
              <Text style={[styles.courseCode, { color: palette.textSecondary }]}>{item.courseCode}</Text>
            )}
          </View>
          <Text style={[styles.totalText, { color: palette.textSecondary }]}>Total experiments: {item.totalExperiments}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, styles.completed]}>
              Completed: {completedNumbers || 'None'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, styles.written]}>
              Written: {writtenNumbers || 'None'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, styles.notCompleted]}>
              Not Completed: {notCompletedNumbers || 'None'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, styles.notGiven]}>
              Not Given: {notGivenNumbers || 'None'}
            </Text>
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
    paddingBottom: 20,
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  cardHeader: {
    marginBottom: 15,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  subjectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  totalText: {
    fontSize: 16,
    color: '#374151',
  },
  statusContainer: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  completed: {
    color: '#10b981',
  },
  written: {
    color: '#f59e0b',
  },
  notCompleted: {
    color: '#ef4444',
  },
  notGiven: {
    color: '#6b7280',
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



