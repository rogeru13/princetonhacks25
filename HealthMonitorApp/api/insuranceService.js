
// api/insuranceService.js
import axios from 'axios';
import Config from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL;

// Setup axios interceptor for authentication (same as in other services)
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

export const fetchInsuranceSummary = async (insuranceId) => {
  try {
    const response = await authAxios.get(`/insurance/${insuranceId}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching insurance summary:', error);
    throw error;
  }
};

export const fetchHighRiskPatients = async (insuranceId) => {
  try {
    const response = await authAxios.get(`/insurance/${insuranceId}/high-risk-patients`);
    return response.data;
  } catch (error) {
    console.error('Error fetching high risk patients:', error);
    throw error;
  }
};

export const fetchAnalyticsData = async (insuranceId, days) => {
  try {
    const response = await authAxios.get(`/insurance/${insuranceId}/analytics`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

export const generateReport = async (insuranceId, reportParams) => {
  try {
    const response = await authAxios.post(`/insurance/${insuranceId}/reports/generate`, reportParams);
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export const fetchReports = async (insuranceId) => {
  try {
    const response = await authAxios.get(`/insurance/${insuranceId}/reports`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

export const fetchPatientRiskAssessment = async (patientId) => {
  try {
    const response = await authAxios.get(`/patients/${patientId}/risk-assessment`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient risk assessment:', error);
    throw error;
  }
};

export const updateRiskParameters = async (insuranceId, parameters) => {
  try {
    const response = await authAxios.put(`/insurance/${insuranceId}/risk-parameters`, parameters);
    return response.data;
  } catch (error) {
    console.error('Error updating risk parameters:', error);
    throw error;
  }
};

// config.js
export default {
  API_URL: 'https://api.healthriskapp.com/v1', // Replace with your actual API URL
  
  // Default settings
  defaultNotificationSettings: {
    reminderNotifications: true,
    missedLogNotifications: true,
    alertNotifications: true,
    emailNotifications: true,
    smsNotifications: false
  },
  
  // Risk levels
  riskLevels: {
    low: { color: '#4CAF50', label: 'Low Risk' },
    medium: { color: '#FF9800', label: 'Medium Risk' },
    high: { color: '#F44336', label: 'High Risk' }
  },
  
  // Common watch types with their normal ranges
  watchTypes: {
    bloodGlucose: {
      name: "Blood Glucose",
      unit: "mg/dL",
      normalRange: "70-140 mg/dL",
      minValue: 40,
      maxValue: 400,
    },
    bloodPressure: {
      name: "Blood Pressure",
      unit: "mmHg",
      normalRange: "Below 120/80 mmHg",
      minValue: 80,
      maxValue: 200,
    },
    weight: {
      name: "Weight",
      unit: "kg",
      minValue: 30,
      maxValue: 250,
    },
    heartRate: {
      name: "Heart Rate",
      unit: "bpm",
      normalRange: "60-100 bpm",
      minValue: 40,
      maxValue: 200,
    },
    temperature: {
      name: "Body Temperature",
      unit: "°C",
      normalRange: "36.1-37.2 °C",
      minValue: 35,
      maxValue: 42,
    }
  }
};