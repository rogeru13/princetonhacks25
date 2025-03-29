// App.js - Main entry point
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth screens
import LoginScreen from './app/(tabs)/auth/LoginScreen';
import RegisterScreen from './app/(tabs)/auth/RegisterScreen';

// User type specific navigators
import PatientNavigator from './navigation/PatientNavigator';
import ProviderNavigator from './navigation/ProviderNavigator';
import InsuranceNavigator from './navigation/InsuranceNavigator';

// Auth context for global state management
import { AuthProvider, useAuth } from './context/AuthContext';

const Stack = createStackNavigator();

// Main app container with authentication logic
const AppContainer = () => {
  const { userToken, userType, isLoading } = useAuth();
  
  if (isLoading) {
    // Return loading screen
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          // Authentication screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // User-specific navigators based on account type
          <>
            {userType === 'patient' && (
              <Stack.Screen name="PatientRoot" component={PatientNavigator} />
            )}
            {userType === 'provider' && (
              <Stack.Screen name="ProviderRoot" component={ProviderNavigator} />
            )}
            {userType === 'insurance' && (
              <Stack.Screen name="InsuranceRoot" component={InsuranceNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App with context providers
export default function App() {
  return (
    <AuthProvider>
      <AppContainer />
    </AuthProvider>
  );
}

// AuthContext.js - Handle authentication and user type
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register, logout } from '../api/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userType, setUserType] = useState(null); // 'patient', 'provider', or 'insurance'
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load stored authentication state on app startup
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const type = await AsyncStorage.getItem('userType');
        const data = await AsyncStorage.getItem('userData');
        
        if (token && type) {
          setUserToken(token);
          setUserType(type);
          setUserData(JSON.parse(data));
        }
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    userToken,
    userType,
    userData,
    isLoading,
    login: async (email, password) => {
      try {
        setIsLoading(true);
        const response = await login(email, password);
        
        if (response.token) {
          setUserToken(response.token);
          setUserType(response.userType);
          setUserData(response.userData);
          
          await AsyncStorage.setItem('userToken', response.token);
          await AsyncStorage.setItem('userType', response.userType);
          await AsyncStorage.setItem('userData', JSON.stringify(response.userData));
        }
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    register: async (userInfo) => {
      try {
        setIsLoading(true);
        const response = await register(userInfo);
        
        if (response.token) {
          setUserToken(response.token);
          setUserType(response.userType);
          setUserData(response.userData);
          
          await AsyncStorage.setItem('userToken', response.token);
          await AsyncStorage.setItem('userType', response.userType);
          await AsyncStorage.setItem('userData', JSON.stringify(response.userData));
        }
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    logout: async () => {
      try {
        setIsLoading(true);
        await logout();
        
        setUserToken(null);
        setUserType(null);
        setUserData(null);
        
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userType');
        await AsyncStorage.removeItem('userData');
      } catch (error) {
        console.error('Logout error', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}