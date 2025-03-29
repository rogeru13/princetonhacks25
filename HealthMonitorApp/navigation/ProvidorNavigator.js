// navigation/ProviderNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Provider Screens
import ProviderDashboardScreen from '../app/(tabs)/provider/DashboardScreen';
import ProviderPatientsScreen from '../app/(tabs)/provider/PatientsScreen';
import ProviderPatientDetailScreen from '../app/(tabs)/provider/PatientDetailScreen';
import ProviderAddWatchScreen from '../app/(tabs)/provider/AddWatchScreen';
import ProviderAnalyticsScreen from '../app/(tabs)/provider/AnalyticsScreen';
import ProviderProfileScreen from '../app/(tabs)/provider/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProviderHomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Dashboard" component={ProviderDashboardScreen} />
    <Stack.Screen name="Analytics" component={ProviderAnalyticsScreen} />
  </Stack.Navigator>
);

const ProviderPatientsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Patients" component={ProviderPatientsScreen} />
    <Stack.Screen name="PatientDetail" component={ProviderPatientDetailScreen} />
    <Stack.Screen name="AddWatch" component={ProviderAddWatchScreen} />
  </Stack.Navigator>
);

const ProviderProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={ProviderProfileScreen} />
  </Stack.Navigator>
);

const ProviderNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Patients') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={ProviderHomeStack} />
      <Tab.Screen name="Patients" component={ProviderPatientsStack} />
      <Tab.Screen name="Profile" component={ProviderProfileStack} />
    </Tab.Navigator>
  );
};

export default ProviderNavigator;
