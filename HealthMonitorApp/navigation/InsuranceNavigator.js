
// navigation/InsuranceNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Insurance Screens
import InsuranceDashboardScreen from '../app/(tabs)/insurance/DashboardScreen';
import InsuranceAnalyticsScreen from '../app/(tabs)/insurance/AnalyticsScreen';
import InsuranceReportsScreen from '../app/(tabs)/insurance/ReportsScreen';
import InsurancePatientDetailScreen from '../app/(tabs)/insurance/PatientDetailScreen';
import InsuranceProfileScreen from '../app/(tabs)/insurance/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const InsuranceHomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Dashboard" component={InsuranceDashboardScreen} />
    <Stack.Screen name="PatientDetail" component={InsurancePatientDetailScreen} />
  </Stack.Navigator>
);

const InsuranceAnalyticsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Analytics" component={InsuranceAnalyticsScreen} />
    <Stack.Screen name="Reports" component={InsuranceReportsScreen} />
  </Stack.Navigator>
);

const InsuranceProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={InsuranceProfileScreen} />
  </Stack.Navigator>
);

const InsuranceNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={InsuranceHomeStack} />
      <Tab.Screen name="Analytics" component={InsuranceAnalyticsStack} />
      <Tab.Screen name="Profile" component={InsuranceProfileStack} />
    </Tab.Navigator>
  );
};

export default InsuranceNavigator;