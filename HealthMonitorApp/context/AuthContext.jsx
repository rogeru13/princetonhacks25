import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set test data
        setUserData({
          id: '123',
          firstName: 'John',
          lastName: 'Smith',
          role: 'insurance',
          companyName: 'Blue Cross'
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const value = {
    userData,
    setUserData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 