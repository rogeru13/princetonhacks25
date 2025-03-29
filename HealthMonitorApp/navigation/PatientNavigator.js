// navigation/PatientNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Patient Screens
import PatientDashboardScreen from '../app/(tabs)/patient/DashboardScreen';
import PatientProfileScreen from '../app/(tabs)/patient/ProfileScreen';
import PatientHealthUpdatesScreen from '../app/(tabs)/patient/HealthUpdatesScreen';
import PatientLogEntryScreen from '../app/(tabs)/patient/LogEntryScreen';
import PatientHistoryScreen from '../app/(tabs)/patient/HistoryScreen';
import PatientNotificationsScreen from '../app/(tabs)/patient/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const PatientHomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Dashboard" component={PatientDashboardScreen} />
    <Stack.Screen name="LogEntry" component={PatientLogEntryScreen} />
    <Stack.Screen name="History" component={PatientHistoryScreen} />
  </Stack.Navigator>
);

const PatientUpdatesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HealthUpdates" component={PatientHealthUpdatesScreen} />
    <Stack.Screen name="LogEntry" component={PatientLogEntryScreen} />
  </Stack.Navigator>
);

const PatientProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={PatientProfileScreen} />
    <Stack.Screen name="Notifications" component={PatientNotificationsScreen} />
  </Stack.Navigator>
);

const PatientNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Updates') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={PatientHomeStack} />
      <Tab.Screen name="Updates" component={PatientUpdatesStack} />
      <Tab.Screen name="Profile" component={PatientProfileStack} />
    </Tab.Navigator>
  );
};

export default PatientNavigator;

