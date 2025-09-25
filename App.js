import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext, lightPalette, darkPalette } from './src/utils/theme';
import { loadTheme, saveTheme } from './src/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { ensureAndroidChannel, scheduleDailyNotification, scheduleWeeklyNotification, requestNotificationPermissions } from './src/utils/notifications';
import { loadNotificationTimes, loadNotificationSchedules } from './src/utils/storage';

// Import screens
import AssignmentsScreen from './src/screens/AssignmentsScreen';
import ExperimentsScreen from './src/screens/ExperimentsScreen';
import TestScoresScreen from './src/screens/TestScoresScreen';
import AssignmentDetailScreen from './src/screens/AssignmentDetailScreen';
import ExperimentDetailScreen from './src/screens/ExperimentDetailScreen';
import TestScoreDetailScreen from './src/screens/TestScoreDetailScreen';
import Header from './src/components/Header';

// Show alerts while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AssignmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ detachPreviousScreen: true, header: ({ navigation, route, options }) => (
      <Header navigation={navigation} title={options.title || 'Assignments'} showBack={false} />
    ) }}>
      <Stack.Screen 
        name="AssignmentsList" 
        component={AssignmentsScreen}
        options={{ title: 'Assignments' }}
      />
      <Stack.Screen 
        name="AssignmentDetail" 
        component={AssignmentDetailScreen}
        options={{ title: 'Assignment Details', header: ({ navigation, route, options }) => (
          <Header navigation={navigation} title={options.title || 'Assignment Details'} showBack={true} />
        ) }}
      />
    </Stack.Navigator>
  );
}

function ExperimentsStack() {
  return (
    <Stack.Navigator screenOptions={{ detachPreviousScreen: true, header: ({ navigation, route, options }) => (
      <Header navigation={navigation} title={options.title || 'Experiments'} showBack={false} />
    ) }}>
      <Stack.Screen 
        name="ExperimentsList" 
        component={ExperimentsScreen}
        options={{ title: 'Experiments' }}
      />
      <Stack.Screen 
        name="ExperimentDetail" 
        component={ExperimentDetailScreen}
        options={{ title: 'Experiment Details', header: ({ navigation, route, options }) => (
          <Header navigation={navigation} title={options.title || 'Experiment Details'} showBack={true} />
        ) }}
      />
    </Stack.Navigator>
  );
}

function TestScoresStack() {
  return (
    <Stack.Navigator screenOptions={{ detachPreviousScreen: true, header: ({ navigation, route, options }) => (
      <Header navigation={navigation} title={options.title || 'Test Scores'} showBack={false} />
    ) }}>
      <Stack.Screen 
        name="TestScoresList" 
        component={TestScoresScreen}
        options={{ title: 'Test Scores' }}
      />
      <Stack.Screen 
        name="TestScoreDetail" 
        component={TestScoreDetailScreen}
        options={{ title: 'Test Score Details', header: ({ navigation, route, options }) => (
          <Header navigation={navigation} title={options.title || 'Test Score Details'} showBack={true} />
        ) }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [mode, setMode] = useState('light');
  const palette = mode === 'light' ? lightPalette : darkPalette;

  useEffect(() => {
    (async () => {
      const saved = await loadTheme();
      setMode(saved);
    })();
  }, []);

  // Schedule saved notifications on app start
  useEffect(() => {
    (async () => {
      await ensureAndroidChannel();
      const granted = await requestNotificationPermissions();
      if (!granted) return;

      // clear existing schedules to avoid duplicates
      try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}

      const times = await loadNotificationTimes(); // [{hour,minute}]
      const days = await loadNotificationSchedules(); // [bool x7]
      if (!Array.isArray(times) || times.length === 0) return;

      const weekdays = Array.isArray(days) && days.length === 7
        ? days.map((on, i) => (on ? i + 1 : null)).filter(Boolean)
        : [1,2,3,4,5,6,7];

      const body = 'Check written assignments/experiments to review.';
      const tasks = [];
      for (const t of times) {
        if (weekdays.length === 7) tasks.push(scheduleDailyNotification(t, body));
        else weekdays.forEach((wd) => tasks.push(scheduleWeeklyNotification(t, wd, body)));
      }
      await Promise.all(tasks);
    })();
  }, []);

  const contextValue = {
    mode,
    palette,
    setMode: async (m) => { setMode(m); await saveTheme(m); },
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <Tab.Navigator
        detachInactiveScreens
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Assignments') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Experiments') {
              iconName = focused ? 'flask' : 'flask-outline';
            } else if (route.name === 'TestScores') {
              iconName = focused ? 'school' : 'school-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: palette.accent,
          tabBarInactiveTintColor: mode === 'light' ? 'gray' : '#94a3b8',
          tabBarStyle: { backgroundColor: palette.surface },
          sceneContainerStyle: { backgroundColor: palette.background },
          headerShown: false,
          unmountOnBlur: true,
        })}
      >
        <Tab.Screen
          name="Assignments"
          component={AssignmentsStack}
          options={{ unmountOnBlur: true }}
        />
        <Tab.Screen
          name="Experiments"
          component={ExperimentsStack}
          options={{ unmountOnBlur: true }}
        />
        <Tab.Screen
          name="TestScores"
          component={TestScoresStack}
          options={{ unmountOnBlur: true }}
        />
      </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}



