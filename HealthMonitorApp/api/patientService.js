// api/patientService.js
import axios from 'axios';
import Config from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL;

// Setup axios interceptor for authentication
const authAxios = axios.create({
  baseURL: API_URL
});

authAxios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchPatientWatches = async (patientId) => {
  try {
    const response = await authAxios.get(`/patients/${patientId}/watches`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient watches:', error);
    throw error;
  }
};

export const fetchRecentLogs = async (patientId) => {
  try {
    const response = await authAxios.get(`/patients/${patientId}/logs/recent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    throw error;
  }
};

export const getWatchDetails = async (watchId) => {
  try {
    const response = await authAxios.get(`/watches/${watchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching watch details:', error);
    throw error;
  }
};

export const submitLogEntry = async (logData) => {
  try {
    const response = await authAxios.post('/logs', logData);
    return response.data;
  } catch (error) {
    console.error('Error submitting log entry:', error);
    throw error;
  }
};

export const fetchPatientHistory = async (patientId, startDate, endDate) => {
  try {
    const response = await authAxios.get(`/patients/${patientId}/logs/history`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient history:', error);
    throw error;
  }
};

export const updatePatientProfile = async (patientId, profileData) => {
  try {
    const response = await authAxios.put(`/patients/${patientId}/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating patient profile:', error);
    throw error;
  }
};

export const updateNotificationSettings = async (patientId, settings) => {
  try {
    const response = await authAxios.put(`/patients/${patientId}/notifications`, settings);
    return response.data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};