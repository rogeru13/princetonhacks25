
// screens/patient/HealthUpdatesScreen.js
import { spacing, fontSizes } from '../../../utils/spacing';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Icon, Button, Divider } from 'react-native-elements';
import { fetchPatientWatches } from '../../../api/patientService';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';

const HealthUpdatesScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWatches = async () => {
    try {
      setLoading(true);
      const watchesData = await fetchPatientWatches(userData.id);
      setWatches(watchesData);
    } catch (error) {
      console.error('Error loading watches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWatches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWatches();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={watches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card containerStyle={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.watchName}>{item.name}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {item.isLoggedToday ? 'Updated Today' : 'Update Needed'}
                </Text>
              </View>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.watchInfo}>
              <View style={styles.infoRow}>
                <Icon name="assignment-ind" type="material" color="#666" size={16} />
                <Text style={styles.infoText}>Assigned by Dr. {item.providerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="date-range" type="material" color="#666" size={16} />
                <Text style={styles.infoText}>Started on {new Date(item.startDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="schedule" type="material" color="#666" size={16} />
                <Text style={styles.infoText}>Log required daily</Text>
              </View>
            </View>
            <Button
              title="Log Update"
              buttonStyle={item.isLoggedToday ? styles.viewButtonStyle : styles.logButtonStyle}
              titleStyle={styles.buttonTitleStyle}
              onPress={() => navigation.navigate('LogEntry', { watchId: item.id })}
              icon={
                <Icon
                  name={item.isLoggedToday ? "visibility" : "add"}
                  type="material"
                  color="#FFFFFF"
                  size={18}
                  style={{ marginRight: 8 }}
                />
              }
            />
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon 
              name="medical-services" 
              type="material" 
              color="#bbb" 
              size={80} 
            />
            <Text style={styles.emptyText}>No health watches assigned yet</Text>
            <Text style={styles.emptySubtext}>
              Your healthcare provider will assign health watches for you to monitor
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={watches.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  watchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e8f4fd',
  },
  statusText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  divider: {
    marginBottom: 15,
  },
  watchInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  logButtonStyle: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 6,
  },
  viewButtonStyle: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 6,
  },
  buttonTitleStyle: {
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default HealthUpdatesScreen;