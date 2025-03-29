// screens/provider/PatientsScreen.js
import { spacing, fontSizes } from '../../../utils/spacing';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  RefreshControl 
} from 'react-native';
import { Icon, Button, Divider } from 'react-native-elements';
import { fetchPatients } from '../../../api/providerService';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';

const PatientsScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await fetchPatients(userData.id);
      setPatients(patientsData);
      setFilteredPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPatients();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(text.toLowerCase()) ||
        patient.id.toString().includes(text)
      );
      setFilteredPatients(filtered);
    }
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  const renderPatientItem = ({ item }) => {
    // Calculate watch status
    const pendingUpdates = item.watches.filter(watch => !watch.isUpdatedToday).length;
    
    return (
      <TouchableOpacity 
        style={styles.patientCard}
        onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
      >
        <View style={styles.patientInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.firstName.charAt(0)}{item.lastName.charAt(0)}
            </Text>
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.patientId}>ID: {item.id}</Text>
            <View style={styles.watchInfo}>
              <Icon name="visibility" type="material" size={14} color="#2196F3" />
              <Text style={styles.watchText}>
                {item.watches.length} {item.watches.length === 1 ? 'watch' : 'watches'}
              </Text>
              {pendingUpdates > 0 && (
                <>
                  <Icon name="warning" type="material" size={14} color="#FF9800" style={{ marginLeft: 8 }} />
                  <Text style={styles.pendingText}>{pendingUpdates} pending</Text>
                </>
              )}
            </View>
          </View>
        </View>
        <Icon name="chevron-right" type="material" color="#bbb" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" type="material" color="#999" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={styles.resultsCount}>
          Showing {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-list" type="material" color="#666" size={20} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredPatients}
        renderItem={renderPatientItem}
        keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people" type="material" color="#ccc" size={60} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No patients found matching your search' : 'No patients found'}
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.fabButton}>
        <Icon name="person-add" type="material" color="#fff" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 15,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  listContent: {
    paddingBottom: 80, // For FAB
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  patientId: {
    fontSize: 14,
    color: '#666',
    marginVertical: 3,
  },
  watchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  watchText: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 5,
  },
  pendingText: {
    fontSize: 14,
    color: '#FF9800',
    marginLeft: 5,
  },
  divider: {
    marginHorizontal: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default PatientsScreen;
