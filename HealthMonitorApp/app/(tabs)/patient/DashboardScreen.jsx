// screens/patient/DashboardScreen.js
import { spacing, fontSizes } from '../../../utils/spacing';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Button, Icon, Divider } from 'react-native-elements';
import { fetchPatientWatches, fetchRecentLogs } from '../../../api/patientService';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { format } from 'date-fns';

const DashboardScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [watches, setWatches] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const watchesData = await fetchPatientWatches(userData.id);
      const logsData = await fetchRecentLogs(userData.id);
      
      setWatches(watchesData);
      setRecentLogs(logsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Function to check for overdue logs
  const getOverdueWatches = () => {
    const today = new Date();
    return watches.filter(watch => {
      const lastLogDate = watch.lastLogDate ? new Date(watch.lastLogDate) : null;
      const isOverdue = !lastLogDate || 
        (today.getDate() !== lastLogDate.getDate() || 
        today.getMonth() !== lastLogDate.getMonth() || 
        today.getFullYear() !== lastLogDate.getFullYear());
      
      return isOverdue;
    });
  };

  const overdueWatches = getOverdueWatches();

  if (!userData) {
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
          Hello, {userData?.firstName || 'User'}!
        </Text>
        <Text style={styles.date}>
          {format(new Date(), 'EEEE, MMMM d')}
        </Text>
      </View>

      {overdueWatches.length > 0 && (
        <Card containerStyle={styles.alertCard}>
          <Card.Title style={styles.alertTitle}>Updates Needed</Card.Title>
          <Card.Divider />
          {overdueWatches.map((watch, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.alertItem} 
              onPress={() => navigation.navigate('LogEntry', { watchId: watch.id })}
            >
              <Icon name="notification-important" type="material" color="#FF6B6B" size={24} />
              <View style={styles.alertTextContainer}>
                <Text style={styles.alertItemTitle}>{watch.name}</Text>
                <Text style={styles.alertItemText}>Please log your daily update</Text>
              </View>
              <Icon name="chevron-right" type="material" color="#888" />
            </TouchableOpacity>
          ))}
        </Card>
      )}

      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>Your Health Watches</Card.Title>
        <Card.Divider />
        {watches.length > 0 ? (
          watches.map((watch, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.watchItem}
              onPress={() => navigation.navigate('LogEntry', { watchId: watch.id })}
            >
              <View style={styles.watchInfo}>
                <Text style={styles.watchName}>{watch.name}</Text>
                <Text style={styles.watchDetails}>Added by Dr. {watch.providerName}</Text>
                <Text style={styles.watchFrequency}>Log daily</Text>
              </View>
              <Button
                title="Log Now"
                type="outline"
                buttonStyle={styles.logButton}
                titleStyle={styles.logButtonText}
                onPress={() => navigation.navigate('LogEntry', { watchId: watch.id })}
              />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No health watches assigned yet.</Text>
        )}
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>Recent Activity</Card.Title>
        <Card.Divider />
        {recentLogs.length > 0 ? (
          recentLogs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <Icon name="check-circle" type="material" color="#4CAF50" size={20} />
              <View style={styles.logInfo}>
                <Text style={styles.logTitle}>
                  {log.watchName}: {log.value} {log.unit}
                </Text>
                <Text style={styles.logDate}>
                  {format(new Date(log.timestamp), 'MMM d, yyyy - h:mm a')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent logs found.</Text>
        )}
        
        <Button
          title="View History"
          type="clear"
          onPress={() => navigation.navigate('History')}
          containerStyle={styles.viewAllButton}
        />
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
    paddingBottom: 10,
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
  card: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    textAlign: 'left',
  },
  alertCard: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#FFF9F9',
    borderLeftWidth: 5,
    borderLeftColor: '#FF6B6B',
  },
  alertTitle: {
    fontSize: 18,
    textAlign: 'left',
    color: '#D32F2F',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  alertItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  alertItemText: {
    fontSize: 14,
    color: '#666',
  },
  watchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  watchInfo: {
    flex: 1,
  },
  watchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  watchDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  watchFrequency: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
  },
  logButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: '#2196F3',
  },
  logButtonText: {
    color: '#2196F3',
    fontSize: 14,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logInfo: {
    marginLeft: 10,
  },
  logTitle: {
    fontSize: 15,
    color: '#333',
  },
  logDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
  viewAllButton: {
    marginTop: 15,
  },
});

export default DashboardScreen;

