// screens/provider/DashboardScreen.js
import { spacing, fontSizes } from '../../../utils/spacing';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Button, Icon, Divider } from 'react-native-elements';
import { fetchProviderSummary, fetchAlerts } from '../../../api/providerService';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';

const DashboardScreen = ({ navigation }) => {
  const { userData, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const loadDashboardData = async () => {
    if (!userData?.id) return;
    
    try {
      setLoading(true);
      const summaryData = await fetchProviderSummary(userData.id);
      const alertsData = await fetchAlerts(userData.id);
      
      setSummary(summaryData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      loadDashboardData();
    }
  }, [userData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (authLoading || !userData) {
    return <LoadingSpinner />;
  }

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, Dr. {userData?.lastName || 'Provider'}
        </Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary?.totalPatients || 0}</Text>
          <Text style={styles.statLabel}>Total Patients</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary?.activeWatches || 0}</Text>
          <Text style={styles.statLabel}>Active Watches</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary?.pendingUpdates || 0}</Text>
          <Text style={styles.statLabel}>Pending Updates</Text>
        </View>
      </View>

      {alerts.length > 0 && (
        <Card containerStyle={styles.alertCard}>
          <Card.Title style={styles.cardTitle}>Patient Alerts</Card.Title>
          <Card.Divider />
          {alerts.map((alert, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.alertItem}
              onPress={() => navigation.navigate('PatientDetail', { patientId: alert.patientId })}
            >
              <View style={[styles.alertIndicator, 
                alert.severity === 'high' ? styles.highAlert : 
                alert.severity === 'medium' ? styles.mediumAlert : styles.lowAlert
              ]} />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.patientName}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>{new Date(alert.timestamp).toLocaleDateString()}</Text>
              </View>
              <Icon name="chevron-right" type="material" color="#888" />
            </TouchableOpacity>
          ))}
          <Button
            title="View All Alerts"
            type="clear"
            containerStyle={styles.viewAllButton}
            onPress={() => navigation.navigate('Analytics')}
          />
        </Card>
      )}

      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>Recent Activities</Card.Title>
        <Card.Divider />
        {summary?.recentActivities?.length > 0 ? (
          summary.recentActivities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <Icon 
                  name={
                    activity.type === 'watch_added' ? 'add-circle' :
                    activity.type === 'data_received' ? 'check-circle' : 'info'
                  } 
                  type="material" 
                  color={
                    activity.type === 'watch_added' ? '#4CAF50' :
                    activity.type === 'data_received' ? '#2196F3' : '#FF9800'
                  } 
                  size={24} 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.description}</Text>
                <Text style={styles.activityTime}>{new Date(activity.timestamp).toLocaleString()}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activities</Text>
        )}
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>Quick Actions</Card.Title>
        <Card.Divider />
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Patients')}
          >
            <Icon name="people" type="material" color="#2196F3" size={28} />
            <Text style={styles.actionButtonText}>View Patients</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddWatch')}
          >
            <Icon name="add-circle" type="material" color="#4CAF50" size={28} />
            <Text style={styles.actionButtonText}>New Watch</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Icon name="insert-chart" type="material" color="#FF9800" size={28} />
            <Text style={styles.actionButtonText}>Analytics</Text>
          </TouchableOpacity>
          </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  alertCard: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#FFF9F9',
    borderLeftWidth: 5,
    borderLeftColor: '#FF6B6B',
  },
  cardTitle: {
    fontSize: 18,
    textAlign: 'left',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  highAlert: {
    backgroundColor: '#F44336',
  },
  mediumAlert: {
    backgroundColor: '#FF9800',
  },
  lowAlert: {
    backgroundColor: '#4CAF50',
  },
  alertContent: {
    flex: 1,
    marginRight: 10,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    marginVertical: 3,
  },
  alertTime: {
    fontSize: 12,
    color: '#888',
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
  },
  viewAllButton: {
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
});

export default DashboardScreen;