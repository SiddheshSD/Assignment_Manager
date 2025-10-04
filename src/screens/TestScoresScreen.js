import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import NeumorphicCard from '../components/NeumorphicCard';
import { ThemeContext } from '../utils/theme';
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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await loadTestScores();
    setTestScores(data);
  };

  const saveData = async (newTestScores) => {
    await saveTestScores(newTestScores);
    setTestScores(newTestScores);
  };

  const handleDeleteTest = (testId) => {
    Alert.alert(
      'Delete Test',
      'Are you sure you want to delete this test?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = testScores.filter(t => t.id !== testId);
            await saveData(updated);
          },
        },
      ]
    );
  };

  const calculatePercentage = (obtained, total) => {
    if (!total || total === 0) return '0.0';
    return ((obtained / total) * 100).toFixed(1);
  };

  const getGradeColor = (percentage) => {
    const p = typeof percentage === 'number' ? percentage : parseFloat(percentage);
    if (p >= 90) return '#10b981';
    if (p >= 80) return '#3b82f6';
    if (p >= 70) return '#f59e0b';
    if (p >= 60) return '#f97316';
    return '#ef4444';
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

    setSelectedYear('');
    setSelectedSemester('');
    setShowAddModal(false);
  };

  const renderTestCard = ({ item }) => {
    const totalObtained = item.subjects.reduce((sum, s) => sum + (s.marksObtained || 0), 0);
    const totalMarks = item.subjects.reduce((sum, s) => sum + (s.totalMarks || 0), 0);
    const overallPercentage = calculatePercentage(totalObtained, totalMarks);
    const overallColor = getGradeColor(overallPercentage);

    return (
      <NeumorphicCard
        onPress={() => navigation.navigate('TestScoreDetail', { testScore: item })}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeftColumn}>
            <Text style={[styles.testType, { color: palette.textPrimary }]}>{item.testType}</Text>
            <Text style={[styles.yearSemester, { color: palette.textSecondary }]}>
              {item.year} SEM {item.semester}
            </Text>
          </View>
          <View style={styles.headerRightColumn}>
            {item.subjects.length > 0 ? (
              <Text style={[styles.percentageText, { color: overallColor }]}>{overallPercentage}%</Text>
            ) : (
              <TouchableOpacity
                onPress={() => handleDeleteTest(item.id)}
                style={[styles.deleteIconButton, { backgroundColor: palette.surface }]}
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {item.subjects.length > 0 ? (
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: palette.textSecondary }]}>Performance Summary</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Obtained</Text>
                <Text style={[styles.statValue, { color: overallColor }]}>{totalObtained}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Total</Text>
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>{totalMarks}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Subjects</Text>
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>{item.subjects.length}</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.subjectsContainer}>
          {item.subjects.length > 0 ? (
            item.subjects.map((subject, index) => {
              const pct = calculatePercentage(subject.marksObtained, subject.totalMarks);
              const pctColor = getGradeColor(pct);
              return (
                <View key={index} style={styles.subjectRow}>
                  <Text style={[styles.subjectText, { color: palette.textPrimary }]}>
                    {subject.name}: {subject.marksObtained}/{subject.totalMarks}
                  </Text>
                  <Text style={[styles.subjectPctText, { color: pctColor }]}>
                    {pct}%
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={[styles.noSubjectsText, { color: palette.textSecondary }]}>No subjects added yet</Text>
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
            <Text style={[styles.modalTitle, { color: React.useContext(ThemeContext).palette.textPrimary }]}>Add New Test</Text>
            
            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: React.useContext(ThemeContext).palette.textPrimary }]}>Test Type:</Text>
              <View style={styles.optionsContainer}>
                {testOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      { backgroundColor: React.useContext(ThemeContext).palette.surface, borderColor: '#4b5563' },
                      selectedTest === option && styles.selectedOption
                    ]}
                    onPress={() => setSelectedTest(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: React.useContext(ThemeContext).palette.textPrimary },
                      selectedTest === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: React.useContext(ThemeContext).palette.textPrimary }]}>Year:</Text>
              <View style={styles.optionsContainer}>
                {yearOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      { backgroundColor: React.useContext(ThemeContext).palette.surface, borderColor: '#4b5563' },
                      selectedYear === option && styles.selectedOption
                    ]}
                    onPress={() => setSelectedYear(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: React.useContext(ThemeContext).palette.textPrimary },
                      selectedYear === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: React.useContext(ThemeContext).palette.textPrimary }]}>Semester:</Text>
              <View style={styles.optionsContainer}>
                {semesterOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      { backgroundColor: React.useContext(ThemeContext).palette.surface, borderColor: '#4b5563' },
                      selectedSemester === option && styles.selectedOption
                    ]}
                    onPress={() => setSelectedSemester(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: React.useContext(ThemeContext).palette.textPrimary },
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

  const palette = React.useContext(ThemeContext).palette;
  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}> 
      <View style={[styles.header, { backgroundColor: palette.background }]}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Test Scores</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: palette.surface }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={palette.textPrimary} />
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
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeftColumn: {
    flex: 1,
  },
  headerRightColumn: {
    alignItems: 'flex-end',
  },
  testType: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  yearSemester: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  statsSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  subjectsContainer: {
    gap: 8,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  subjectPctText: {
    fontSize: 14,
    fontWeight: '700',
  },
  noSubjectsText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  overallRowContainer: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#eef1f7',
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  overallTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  overallHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  overallHeaderText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  overallValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overallValueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
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
    fontWeight: '700',
    color: '#111827',
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



