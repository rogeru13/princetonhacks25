// screens/insurance/DashboardScreen.js
import { spacing, fontSizes } from '../../../utils/spacing';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Icon, Button, Divider } from 'react-native-elements';
import { fetchInsuranceSummary, fetchHighRiskPatients } from '../../../api/insuranceService';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { userData, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState(null);
  const [highRiskPatients, setHighRiskPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!userData?.id) return;

    try {
      setLoading(true);
      const summaryData = await fetchInsuranceSummary(userData.id);
      const highRiskData = await fetchHighRiskPatients(userData.id);
      
      setSummary(summaryData);
      setHighRiskPatients(highRiskData);
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

  // Show loading spinner while initial data loads
  if (authLoading || (loading && !refreshing)) {
    return <LoadingSpinner />;
  }

  // Early return if no user data
  if (!userData) {
    return null;
  }

  // Safe access to user data
  const firstName = userData?.firstName ?? 'User';
  const companyName = userData?.companyName ?? 'Insurance Company';

  const riskDistributionData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [
          summary?.riskDistribution?.low || 0,
          summary?.riskDistribution?.medium || 0,
          summary?.riskDistribution?.high || 0
        ]
      }
    ]
  };

  const complianceData = {
    labels: ['Compliant', 'Non-Compliant'],
    data: [
      summary?.complianceRate || 0,
      100 - (summary?.complianceRate || 0)
    ],
    colors: ['#4CAF50', '#FF5722']
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {firstName}</Text>
        <Text style={styles.companyName}>{companyName}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary?.totalPatients || 0}</Text>
          <Text style={styles.statLabel}>Total Members</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary?.activeWatches || 0}</Text>
          <Text style={styles.statLabel}>Active Monitors</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, styles.alertValue]}>
            {summary?.highRiskCount || 0}
          </Text>
          <Text style={styles.statLabel}>High Risk</Text>
        </View>
      </View>

      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>Risk Distribution</Card.Title>
        <Card.Divider />
        <View style={styles.chartContainer}>
          <BarChart
            data={riskDistributionData}
            width={width - 60}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.7,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>Compliance Rate</Card.Title>
        <Card.Divider />
        <View style={styles.complianceContainer}>
          <PieChart
            data={complianceData.data.map((value, index) => ({
              name: complianceData.labels[index],
              value,
              color: complianceData.colors[index],
              legendFontColor: '#7F7F7F',
              legendFontSize: 12
            }))}
            width={width - 60}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
          <View style={styles.complianceSummary}>
            <Text style={styles.complianceRate}>
              {summary?.complianceRate || 0}%
            </Text>
            <Text style={styles.complianceLabel}>Compliance Rate</Text>
          </View>
        </View>
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>High Risk Members</Card.Title>
        <Card.Divider />
        {highRiskPatients.length > 0 ? (
          highRiskPatients.map((patient, index) => (
            <TouchableOpacity 
              key={patient.id}
              style={styles.patientItem}
              onPress={() => navigation.navigate('PatientDetail', { patientId: patient.id })}
            >
              <View style={styles.patientIconContainer}>
                <Icon 
                  name="person" 
                  type="material" 
                  color="#fff" 
                  size={20} 
                  containerStyle={[
                    styles.patientIcon, 
                    { backgroundColor: patient.riskLevel === 'high' ? '#F44336' : '#FF9800' }
                  ]} 
                />
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
                <Text style={styles.patientDetails}>
                  {patient.watchCount} active monitors
                </Text>
                <View style={styles.riskBadge}>
                  <Text style={styles.riskText}>
                    {patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)} Risk
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" type="material" color="#bbb" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No high risk members found</Text>
        )}
        <Button
          title="View All Risk Assessments"
          type="clear"
          containerStyle={styles.viewAllButton}
          onPress={() => navigation.navigate('Analytics')}
        />
      </Card>

      <View style={styles.quickAccessContainer}>
        <Text style={styles.quickAccessTitle}>Quick Access</Text>
        <View style={styles.quickAccessButtons}>
          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Icon name="bar-chart" type="material" color="#2196F3" size={28} />
            <Text style={styles.quickAccessText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => navigation.navigate('Reports')}
          >
            <Icon name="description" type="material" color="#4CAF50" size={28} />
            <Text style={styles.quickAccessText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAccessButton}
          >
            <Icon name="settings" type="material" color="#FF9800" size={28} />
            <Text style={styles.quickAccessText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: '#2196F3',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  companyName: {
    fontSize: 16,
    color: '#e1f5fe',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  alertValue: {
    color: '#F44336',
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
  cardTitle: {
    fontSize: 18,
    textAlign: 'left',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  complianceContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  complianceSummary: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -30 }],
  },
  complianceRate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  complianceLabel: {
    fontSize: 12,
    color: '#666',
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  patientIconContainer: {
    marginRight: 15,
  },
  patientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  patientDetails: {
    fontSize: 14,
    color: '#666',
    marginVertical: 3,
  },
  riskBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  riskText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
  viewAllButton: {
    marginTop: 10,
  },
  quickAccessContainer: {
    padding: 15,
    marginBottom: 20,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  quickAccessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAccessButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAccessText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});

export default DashboardScreen;
