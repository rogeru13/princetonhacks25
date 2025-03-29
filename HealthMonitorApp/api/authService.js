// api/authService.js
import axios from 'axios';
import Config from '../config';

const API_URL = Config.API_URL;

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const register = async (userInfo) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userInfo);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/logout`);
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    // Still allow logout on client side even if server fails
  }
};

export const resetPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { email });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Helper function to handle API errors
const handleError = (error) => {
  if (error.response) {
    // Server responded with error
    return {
      status: error.response.status,
      message: error.response.data.message || 'An error occurred',
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    return {
      status: 0,
      message: 'Server not responding. Please check your connection.'
    };
  } else {
    // Error in request setup
    return {
      status: 0,
      message: error.message || 'An unexpected error occurred'
    };
  }
};


