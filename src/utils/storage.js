import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ASSIGNMENTS: 'assignments',
  EXPERIMENTS: 'experiments',
  TEST_SCORES: 'test_scores',
  THEME: 'app_theme',
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

export const saveTheme = async (theme) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

export const loadTheme = async () => {
  try {
    const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return theme || 'light';
  } catch (error) {
    console.error('Error loading theme:', error);
    return 'light';
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ASSIGNMENTS,
      STORAGE_KEYS.EXPERIMENTS,
      STORAGE_KEYS.TEST_SCORES,
      STORAGE_KEYS.THEME,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};



