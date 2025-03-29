// context/AuthContext.js
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