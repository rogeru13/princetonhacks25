import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Icon, Button, Divider } from 'react-native-elements';
import { fetchPatientDetails } from '../../../api/patientService';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';

const PatientDetailScreen = ({ route, navigation }) => {
  const { userData, loading: authLoading } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get patientId from route params with fallback
  const patientId = route?.params?.patientId;

  const loadPatientData = async () => {
    if (!patientId || !userData?.id) return;

    try {
      setLoading(true);
      const patientData = await fetchPatientDetails(patientId);
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (patientId && userData?.id) {
      loadPatientData();
    }
  }, [patientId, userData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPatientData();
  };

  // Show loading spinner while data loads
  if (authLoading || (loading && !refreshing)) {
    return <LoadingSpinner />;
  }

  // Early return if no patient ID or data
  if (!patientId || !patient) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" type="material" size={48} color="#666" />
        <Text style={styles.errorText}>Patient not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          type="clear"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.patientName}>
          {patient?.firstName} {patient?.lastName}
        </Text>
        <Text style={styles.patientId}>ID: {patient?.id}</Text>
      </View>

      {/* Rest of your patient detail content */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  patientId: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  // ... rest of your styles
});

export default PatientDetailScreen; 