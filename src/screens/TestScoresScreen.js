import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NeumorphicCard from '../components/NeumorphicCard';
import NeumorphicButton from '../components/NeumorphicButton';
import { saveTestScores, loadTestScores } from '../utils/storage';

const TestScoresScreen = ({ navigation }) => {
  const [testScores, setTestScores] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const testOptions = ['UT1', 'UT2', 'Finals'];
  const yearOptions = ['FE', 'SE', 'TE', 'BE'];
  const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await loadTestScores();
    setTestScores(data);
  };

  const saveData = async (newTestScores) => {
    await saveTestScores(newTestScores);
    setTestScores(newTestScores);
  };

  const handleAddTest = () => {
    if (!selectedTest || !selectedYear || !selectedSemester) {
      Alert.alert('Error', 'Please select all options');
      return;
    }

    const newTestScore = {
      id: Date.now().toString(),
      testType: selectedTest,
      year: selectedYear,
      semester: selectedSemester,
      subjects: [],
    };

    const newTestScores = [...testScores, newTestScore];
    saveData(newTestScores);

    setSelectedTest('');
    setSelectedYear('');
    setSelectedSemester('');
    setShowAddModal(false);
  };

  const renderTestCard = ({ item }) => {
    return (
      <NeumorphicCard
        onPress={() => navigation.navigate('TestScoreDetail', { testScore: item })}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.testType}>{item.testType}</Text>
          <Text style={styles.yearSemester}>
            {item.year} SEM {item.semester}
          </Text>
        </View>
        
        <View style={styles.subjectsContainer}>
          {item.subjects.length > 0 ? (
            item.subjects.map((subject, index) => (
              <Text key={index} style={styles.subjectText}>
                {subject.name}: {subject.marksObtained}/{subject.totalMarks}
              </Text>
            ))
          ) : (
            <Text style={styles.noSubjectsText}>No subjects added yet</Text>
          )}
        </View>
      </NeumorphicCard>
    );
  };

  const renderAddModal = () => {
    return (
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <NeumorphicCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Test</Text>
            
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Test Type:</Text>
              <View style={styles.optionsContainer}>
                {testOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      selectedTest === option && styles.selectedOption
                    ]}
                    onPress={() => setSelectedTest(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedTest === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Year:</Text>
              <View style={styles.optionsContainer}>
                {yearOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      selectedYear === option && styles.selectedOption
                    ]}
                    onPress={() => setSelectedYear(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedYear === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Semester:</Text>
              <View style={styles.optionsContainer}>
                {semesterOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      selectedSemester === option && styles.selectedOption
                    ]}
                    onPress={() => setSelectedSemester(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedSemester === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <NeumorphicButton
                title="Cancel"
                onPress={() => {
                  setShowAddModal(false);
                  setSelectedTest('');
                  setSelectedYear('');
                  setSelectedSemester('');
                }}
                style={[styles.modalButton, styles.cancelButton]}
                textStyle={styles.cancelButtonText}
              />
              <NeumorphicButton
                title="Add Test"
                onPress={handleAddTest}
                style={[styles.modalButton, styles.addButton]}
              />
            </View>
          </NeumorphicCard>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test Scores</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {renderAddModal()}

      <FlatList
        data={testScores}
        renderItem={renderTestCard}
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
    color: '#333',
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
  testType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  yearSemester: {
    fontSize: 16,
    color: '#666',
  },
  subjectsContainer: {
    gap: 5,
  },
  subjectText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  noSubjectsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
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

export default TestScoresScreen;



