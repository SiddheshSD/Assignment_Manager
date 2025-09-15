import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NeumorphicCard from '../components/NeumorphicCard';
import NeumorphicButton from '../components/NeumorphicButton';
import NeumorphicInput from '../components/NeumorphicInput';
import { saveTestScores, loadTestScores } from '../utils/storage';

const TestScoreDetailScreen = ({ route, navigation }) => {
  const { testScore: initialTestScore } = route.params;
  const [testScore, setTestScore] = useState(initialTestScore);
  const [showAddForm, setShowAddForm] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [totalMarks, setTotalMarks] = useState('');

  useEffect(() => {
    navigation.setOptions({
      title: `${testScore.testType} - ${testScore.year} SEM ${testScore.semester}`,
    });
  }, [testScore.testType, testScore.year, testScore.semester]);

  const saveData = async () => {
    const allTestScores = await loadTestScores();
    const updatedTestScores = allTestScores.map((item) =>
      item.id === testScore.id ? testScore : item
    );
    await saveTestScores(updatedTestScores);
  };

  const handleSave = async () => {
    await saveData();
    navigation.goBack();
  };

  const handleAddSubject = () => {
    if (!subjectName.trim() || !marksObtained.trim() || !totalMarks.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const obtained = parseFloat(marksObtained);
    const total = parseFloat(totalMarks);

    if (isNaN(obtained) || isNaN(total) || obtained < 0 || total <= 0 || obtained > total) {
      Alert.alert('Error', 'Please enter valid marks');
      return;
    }

    const newSubject = {
      id: Date.now().toString(),
      name: subjectName.trim(),
      marksObtained: obtained,
      totalMarks: total,
    };

    const updatedTestScore = {
      ...testScore,
      subjects: [...testScore.subjects, newSubject],
    };

    setTestScore(updatedTestScore);
    saveData();

    setSubjectName('');
    setMarksObtained('');
    setTotalMarks('');
    setShowAddForm(false);
  };

  const handleDeleteSubject = (subjectId) => {
    Alert.alert(
      'Delete Subject',
      'Are you sure you want to delete this subject?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTestScore = {
              ...testScore,
              subjects: testScore.subjects.filter((subject) => subject.id !== subjectId),
            };
            setTestScore(updatedTestScore);
            saveData();
          },
        },
      ]
    );
  };

  const calculatePercentage = (obtained, total) => {
    return ((obtained / total) * 100).toFixed(1);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 80) return '#3b82f6';
    if (percentage >= 70) return '#f59e0b';
    if (percentage >= 60) return '#f97316';
    return '#ef4444';
  };

  const renderSubjectItem = ({ item }) => {
    const percentage = calculatePercentage(item.marksObtained, item.totalMarks);
    const gradeColor = getGradeColor(percentage);

    return (
      <NeumorphicCard style={styles.subjectCard}>
        <View style={styles.subjectHeader}>
          <Text style={styles.subjectName}>{item.name}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSubject(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.marksContainer}>
          <View style={styles.marksRow}>
            <Text style={styles.marksLabel}>Marks Obtained:</Text>
            <Text style={[styles.marksValue, { color: gradeColor }]}>
              {item.marksObtained}
            </Text>
          </View>
          <View style={styles.marksRow}>
            <Text style={styles.marksLabel}>Total Marks:</Text>
            <Text style={styles.marksValue}>{item.totalMarks}</Text>
          </View>
          <View style={styles.marksRow}>
            <Text style={styles.marksLabel}>Percentage:</Text>
            <Text style={[styles.marksValue, { color: gradeColor, fontWeight: 'bold' }]}>
              {percentage}%
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
        <Text style={styles.formTitle}>Add New Subject</Text>
        <NeumorphicInput
          placeholder="Subject Name"
          value={subjectName}
          onChangeText={setSubjectName}
          style={styles.input}
        />
        <NeumorphicInput
          placeholder="Marks Obtained"
          value={marksObtained}
          onChangeText={setMarksObtained}
          keyboardType="numeric"
          style={styles.input}
        />
        <NeumorphicInput
          placeholder="Total Marks"
          value={totalMarks}
          onChangeText={setTotalMarks}
          keyboardType="numeric"
          style={styles.input}
        />
        <View style={styles.buttonContainer}>
          <NeumorphicButton
            title="Cancel"
            onPress={() => {
              setShowAddForm(false);
              setSubjectName('');
              setMarksObtained('');
              setTotalMarks('');
            }}
            style={[styles.button, styles.cancelButton]}
            textStyle={styles.cancelButtonText}
          />
          <NeumorphicButton
            title="Add Subject"
            onPress={handleAddSubject}
            style={[styles.button, styles.addButton]}
          />
        </View>
      </NeumorphicCard>
    );
  };

  const calculateOverallStats = () => {
    if (testScore.subjects.length === 0) return null;

    const totalObtained = testScore.subjects.reduce((sum, subject) => sum + subject.marksObtained, 0);
    const totalMarks = testScore.subjects.reduce((sum, subject) => sum + subject.totalMarks, 0);
    const overallPercentage = calculatePercentage(totalObtained, totalMarks);
    const gradeColor = getGradeColor(overallPercentage);

    return {
      totalObtained,
      totalMarks,
      overallPercentage,
      gradeColor,
    };
  };

  const overallStats = calculateOverallStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.testInfo}>
          {testScore.testType} - {testScore.year} SEM {testScore.semester}
        </Text>
        <View style={styles.rightControls}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Ionicons name="checkmark-done-outline" size={20} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Ionicons name="add" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      {overallStats && (
        <NeumorphicCard style={styles.statsCard}>
          <Text style={styles.statsTitle}>Overall Performance</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Obtained:</Text>
              <Text style={[styles.statValue, { color: overallStats.gradeColor }]}>
                {overallStats.totalObtained}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Marks:</Text>
              <Text style={styles.statValue}>{overallStats.totalMarks}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Overall %:</Text>
              <Text style={[styles.statValue, { color: overallStats.gradeColor, fontWeight: 'bold' }]}>
                {overallStats.overallPercentage}%
              </Text>
            </View>
          </View>
        </NeumorphicCard>
      )}

      {renderAddForm()}

      <FlatList
        data={testScore.subjects}
        renderItem={renderSubjectItem}
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
  testInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#f0f0f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#f0f0f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 10,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  listContainer: {
    paddingBottom: 20,
  },
  subjectCard: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  marksContainer: {
    gap: 8,
  },
  marksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marksLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  marksValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  addForm: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  addButton: {
    backgroundColor: '#f0f0f3',
  },
});

export default TestScoreDetailScreen;



