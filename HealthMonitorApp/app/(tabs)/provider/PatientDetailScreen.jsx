
// screens/provider/PatientDetailScreen.js
import { spacing, fontSizes } from '../../../utils/spacing';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl 
} from 'react-native';
import { Card, Icon, Button, Divider, Badge } from 'react-native-elements';
import { fetchPatientDetails, fetchPatientLogs } from '../../../api/providerService';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PatientDetailScreen = ({ route, navigation }) => {
  const { patientId } = route.params;
  const { userData } = useAuth();
  const [patient, setPatient] = useState(null);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWatch, setSelectedWatch] = useState(null);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const patientData = await fetchPatientDetails(patientId);
      const logsData = await fetchPatientLogs(patientId);
      
      setPatient(patientData);
      setLogs(logsData);
      
      // Set first watch as selected if not already set
      if (patientData.watches.length > 0 && !selectedWatch) {
        setSelectedWatch(patientData.watches[0].id);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPatientData();
  };

  const getChartData = (watchId) => {
    if (!logs[watchId] || logs[watchId].length === 0) {
      return {
        labels: [],
        datasets: [{ data: [0] }]
      };
    }

    // Sort by date
    const sortedLogs = [...logs[watchId]].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Take last 7 entries or fewer if not available
    const recentLogs = sortedLogs.slice(-7);
    
    return {
      labels: recentLogs.map(log => {
        const date = new Date(log.timestamp);
        return `${date.getMonth()+1}/${date.getDate()}`;
      }),
      datasets: [{
        data: recentLogs.map(log => log.value),
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  if (!patient) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" type="material" color="#F44336" size={60} />
        <Text style={styles.errorText}>Failed to load patient data</Text>
        <Button 
          title="Try Again" 
          onPress={loadPatientData}
          buttonStyle={styles.retryButton} 
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
        <View style={styles.patientInfoContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
            </Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
            <Text style={styles.patientDetails}>ID: {patient.id}</Text>
            <Text style={styles.patientDetails}>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="phone" type="material" color="#4CAF50" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="email" type="material" color="#2196F3" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="message" type="material" color="#FF9800" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Card containerStyle={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Health Watches</Text>
          <Button
            title="Add Watch"
            type="clear"
            icon={<Icon name="add-circle-outline" type="material" color="#2196F3" size={20} />}
            titleStyle={{ fontSize: 14 }}
            onPress={() => navigation.navigate('AddWatch', { patientId: patient.id })}
          />
        </View>
        <Card.Divider />
        
        {patient.watches.length > 0 ? (
          patient.watches.map((watch, index) => (
            <TouchableOpacity 
              key={watch.id} 
              style={[
                styles.watchItem,
                selectedWatch === watch.id && styles.selectedWatchItem
              ]}
              onPress={() => setSelectedWatch(watch.id)}
            >
              <View style={styles.watchInfo}>
                <Text style={styles.watchName}>{watch.name}</Text>
                <Text style={styles.watchDetails}>
                  Last updated: {watch.lastUpdated ? new Date(watch.lastUpdated).toLocaleDateString() : 'Never'}
                </Text>
              </View>
              <Badge 
                status={watch.isUpdatedToday ? "success" : "warning"} 
                value={watch.isUpdatedToday ? "Updated" : "Pending"} 
                badgeStyle={styles.badge}
                textStyle={styles.badgeText}
              />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No health watches assigned</Text>
        )}
      </Card>
      
      {selectedWatch && logs[selectedWatch] && (
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>
            {patient.watches.find(w => w.id === selectedWatch)?.name} Data
          </Card.Title>
          <Card.Divider />
          
          <View style={styles.chartContainer}>
            <LineChart
              data={getChartData(selectedWatch)}
              width={width - 60}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#2196F3"
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
          
          <View style={styles.logsList}>
            <Text style={styles.logsTitle}>Recent Entries</Text>
            {logs[selectedWatch] && logs[selectedWatch].length > 0 ? (
              logs[selectedWatch].slice(-5).reverse().map((log, index) => (
                <View key={index} style={styles.logItem}>
                  <View style={styles.logMain}>
                    <Text style={styles.logValue}>
                      {log.value} {log.unit}
                    </Text>
                    <Text style={styles.logTime}>
                      {new Date(log.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  {log.notes && (
                    <Text style={styles.logNotes}>{log.notes}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No log entries found</Text>
            )}
          </View>
        </Card>
      )}
      
      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>Patient Notes</Card.Title>
        <Card.Divider />
        {patient.notes && patient.notes.length > 0 ? (
          patient.notes.map((note, index) => (
            <View key={index} style={styles.noteItem}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteAuthor}>Dr. {note.authorName}</Text>
                <Text style={styles.noteDate}>
                  {new Date(note.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.noteContent}>{note.content}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No notes available</Text>
        )}
        <Button
          title="Add Note"
          icon={<Icon name="note-add" type="material" color="#fff" size={20} style={{ marginRight: 10 }} />}
          buttonStyle={styles.addNoteButton}
          containerStyle={{ marginTop: 15 }}
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
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  patientInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  patientInfo: {
    flexShrink: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  patientDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  card: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    textAlign: 'left',
  },
  watchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedWatchItem: {
    backgroundColor: '#e3f2fd',
  },
  watchInfo: {
    flex: 1,
  },
  watchName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  watchDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  badge: {
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  logsList: {
    marginTop: 15,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  logItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  logMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  logValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  logTime: {
    fontSize: 12,
    color: '#888',
  },
  logNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  noteItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
  },
  noteContent: {
    fontSize: 14,
    color: '#333',
  },
  addNoteButton: {
    backgroundColor: '#4CAF50',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: 15,
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
    marginVertical: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
  },
});

export default PatientDetailScreen;