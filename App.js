import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import AssignmentsScreen from './src/screens/AssignmentsScreen';
import ExperimentsScreen from './src/screens/ExperimentsScreen';
import TestScoresScreen from './src/screens/TestScoresScreen';
import AssignmentDetailScreen from './src/screens/AssignmentDetailScreen';
import ExperimentDetailScreen from './src/screens/ExperimentDetailScreen';
import TestScoreDetailScreen from './src/screens/TestScoreDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AssignmentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AssignmentsList" 
        component={AssignmentsScreen}
        options={{ title: 'Assignments' }}
      />
      <Stack.Screen 
        name="AssignmentDetail" 
        component={AssignmentDetailScreen}
        options={{ title: 'Assignment Details' }}
      />
    </Stack.Navigator>
  );
}

function ExperimentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ExperimentsList" 
        component={ExperimentsScreen}
        options={{ title: 'Experiments' }}
      />
      <Stack.Screen 
        name="ExperimentDetail" 
        component={ExperimentDetailScreen}
        options={{ title: 'Experiment Details' }}
      />
    </Stack.Navigator>
  );
}

function TestScoresStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TestScoresList" 
        component={TestScoresScreen}
        options={{ title: 'Test Scores' }}
      />
      <Stack.Screen 
        name="TestScoreDetail" 
        component={TestScoreDetailScreen}
        options={{ title: 'Test Score Details' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
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
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Assignments" component={AssignmentsStack} />
        <Tab.Screen name="Experiments" component={ExperimentsStack} />
        <Tab.Screen name="TestScores" component={TestScoresStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}



