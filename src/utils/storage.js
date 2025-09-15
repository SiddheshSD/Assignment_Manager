import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ASSIGNMENTS: 'assignments',
  EXPERIMENTS: 'experiments',
  TEST_SCORES: 'test_scores',
};

export const saveData = async (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const loadData = async (key) => {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    return jsonData ? JSON.parse(jsonData) : [];
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
};

export const saveAssignments = (assignments) => saveData(STORAGE_KEYS.ASSIGNMENTS, assignments);
export const loadAssignments = () => loadData(STORAGE_KEYS.ASSIGNMENTS);

export const saveExperiments = (experiments) => saveData(STORAGE_KEYS.EXPERIMENTS, experiments);
export const loadExperiments = () => loadData(STORAGE_KEYS.EXPERIMENTS);

export const saveTestScores = (testScores) => saveData(STORAGE_KEYS.TEST_SCORES, testScores);
export const loadTestScores = () => loadData(STORAGE_KEYS.TEST_SCORES);



