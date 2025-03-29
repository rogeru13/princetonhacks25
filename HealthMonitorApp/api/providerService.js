
// api/providerService.js
import axios from 'axios';
import Config from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL;

// Setup axios interceptor for authentication (same as in patientService)
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

export const fetchProviderSummary = async (providerId) => {
  try {
    const response = await authAxios.get(`/providers/${providerId}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching provider summary:', error);
    throw error;
  }
};

export const fetchAlerts = async (providerId) => {
  try {
    const response = await authAxios.get(`/providers/${providerId}/alerts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const fetchPatients = async (providerId) => {
  try {
    const response = await authAxios.get(`/providers/${providerId}/patients`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

export const fetchPatientDetails = async (patientId) => {
  try {
    const response = await authAxios.get(`/patients/${patientId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
};

export const fetchPatientLogs = async (patientId) => {
  try {
    const response = await authAxios.get(`/patients/${patientId}/logs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient logs:', error);
    throw error;
  }
};

export const addWatch = async (watchData) => {
  try {
    const response = await authAxios.post('/watches', watchData);
    return response.data;
  } catch (error) {
    console.error('Error adding watch:', error);
    throw error;
  }
};

export const updateWatch = async (watchId, watchData) => {
  try {
    const response = await authAxios.put(`/watches/${watchId}`, watchData);
    return response.data;
  } catch (error) {
    console.error('Error updating watch:', error);
    throw error;
  }
};

export const deleteWatch = async (watchId) => {
  try {
    const response = await authAxios.delete(`/watches/${watchId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting watch:', error);
    throw error;
  }
};

export const addPatientNote = async (patientId, noteData) => {
  try {
    const response = await authAxios.post(`/patients/${patientId}/notes`, noteData);
    return response.data;
  } catch (error) {
    console.error('Error adding patient note:', error);
    throw error;
  }
};

export const fetchAnalytics = async (providerId, timeframe) => {
  try {
    const response = await authAxios.get(`/providers/${providerId}/analytics`, {
      params: { timeframe }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};
