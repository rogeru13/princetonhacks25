
// screens/insurance/AnalyticsScreen.js
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
import { Card, Icon, Button, ButtonGroup, Divider } from 'react-native-elements';
import { fetchAnalyticsData } from '../../../api/insuranceService';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  ProgressChart 
} from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState(1); // 0: Week, 1: Month, 2: Quarter, 3: Year
  const [chartType, setChartType] = useState(0); // 0: Risk, 1: Compliance, 2: Cost

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Get time range in days
      let days;
      switch (timeRange) {
        case 0: // Week
          days = 7;
          break;
        case 1: // Month
          days = 30;
          break;
        case 2: // Quarter
          days = 90;
          break;
        case 3: // Year
          days = 365;
          break;
        default:
          days = 30;
      }
      
      const data = await fetchAnalyticsData(userData.id, days);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  const getRiskTrendData = () => {
    if (!analytics || !analytics.riskTrend) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    
    return {
      labels: analytics.riskTrend.map(item => item.label.substring(0, 3)),
      datasets: [
        {
          data: analytics.riskTrend.map(item => item.highRiskPercentage),
          color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
          strokeWidth: 2,
          label: 'High'
        },
        {
          data: analytics.riskTrend.map(item => item.mediumRiskPercentage),
          color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
          strokeWidth: 2,
          label: 'Medium'
        },
        {
          data: analytics.riskTrend.map(item => item.lowRiskPercentage),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
          label: 'Low'
        }
      ]
    };
  };

  const getComplianceData = () => {
    if (!analytics || !analytics.complianceTrend) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    
    return {
      labels: analytics.complianceTrend.map(item => item.label.substring(0, 3)),
      datasets: [
        {
          data: analytics.complianceTrend.map(item => item.rate),
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  const getCostSavingsData = () => {
    if (!analytics || !analytics.costSavings) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    
    return {
      labels: analytics.costSavings.map(item => item.category),
      datasets: [
        {
          data: analytics.costSavings.map(item => item.amount)
        }
      ]
    };
  };

  const getCurrentChartData = () => {
    switch (chartType) {
      case 0:
        return getRiskTrendData();
      case 1:
        return getComplianceData();
      case 2:
        return getCostSavingsData();
      default:
        return getRiskTrendData();
    }
  };

  const renderChart = () => {
    const chartData = getCurrentChartData();
    
    switch (chartType) {
      case 0: // Risk
        return (
          <LineChart
            data={chartData}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "4",
                strokeWidth: "1"
              }
            }}
            bezier
            style={styles.chart}
            legend={['High', 'Medium', 'Low']}
          />
        );
      case 1: // Compliance
        return (
          <LineChart
            data={chartData}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "4",
                strokeWidth: "1"
              }
            }}
            bezier
            style={styles.chart}
          />
        );
      case 2: // Cost
        return (
          <BarChart
            data={chartData}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              barPercentage: 0.7
            }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
      </View>
      
      <View style={styles.filterContainer}>
        <ButtonGroup
          buttons={['Week', 'Month', 'Quarter', 'Year']}
          selectedIndex={timeRange}
          onPress={(selected) => setTimeRange(selected)}
          containerStyle={styles.buttonGroupContainer}
          selectedButtonStyle={styles.selectedButton}
        />
      </View>
      
      <View style={styles.chartTypeContainer}>
        <ButtonGroup
          buttons={['Risk Trends', 'Compliance', 'Cost Savings']}
          selectedIndex={chartType}
          onPress={(selected) => setChartType(selected)}
          containerStyle={styles.chartTypeButtonGroup}
          selectedButtonStyle={styles.selectedButton}
        />
      </View>
      
      <Card containerStyle={styles.chartCard}>
        <Card.Title style={styles.cardTitle}>
          {chartType === 0 ? 'Risk Level Trends' : 
           chartType === 1 ? 'Compliance Rate Trend' : 'Cost Savings by Category'}
        </Card.Title>
        <Card.Divider />
        <View style={styles.chartContainer}>
          {renderChart()}
        </View>
        <Text style={styles.chartNote}>
          {chartType === 0 ? 'Percentage of members in each risk category over time' : 
           chartType === 1 ? 'Member compliance with monitoring requirements' :
           'Estimated cost savings from preventive care'}
        </Text>
      </Card>
      
      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>Key Insights</Card.Title>
        <Card.Divider />
        {analytics?.insights ? (
          analytics.insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Icon 
                name={
                  insight.type === 'positive' ? 'trending-up' : 
                  insight.type === 'negative' ? 'trending-down' : 'info'
                }
                type="material" 
                color={
                  insight.type === 'positive' ? '#4CAF50' : 
                  insight.type === 'negative' ? '#F44336' : '#2196F3'
                }
                size={24}
                containerStyle={styles.insightIcon}
              />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>
                  {insight.description}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No insights available for this time period</Text>
        )}
      </Card>
      
      <View style={styles.summaryCards}>
        <Card containerStyle={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Average Cost</Text>
            <Text style={styles.summaryValue}>
              ${analytics?.averageCost?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.summaryLabel}>Per Member</Text>
          </View>
        </Card>
        
        <Card containerStyle={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Total Savings</Text>
            <Text style={[styles.summaryValue, styles.positiveValue]}>
              ${analytics?.totalSavings?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.summaryLabel}>Estimated</Text>
          </View>
        </Card>
      </View>
      
      <Button
        title="Generate Detailed Report"
        icon={<Icon name="description" type="material" color="#fff" size={20} style={{ marginRight: 10 }} />}
        buttonStyle={styles.reportButton}
        containerStyle={styles.reportButtonContainer}
        onPress={() => navigation.navigate('Reports')}
      />
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    padding: 15,
    paddingBottom: 0,
  },
  buttonGroupContainer: {
    marginBottom: 0,
    borderRadius: 8,
    borderColor: '#e0e0e0',
  },
  chartTypeContainer: {
    padding: 15,
  },
  chartTypeButtonGroup: {
    borderRadius: 8,
    borderColor: '#e0e0e0',
  },
  selectedButton: {
    backgroundColor: '#2196F3',
  },
  chartCard: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
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
  chartNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
  insightItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  insightIcon: {
    marginRight: 15,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 10,
    padding: 15,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  positiveValue: {
    color: '#4CAF50',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
  },
  reportButtonContainer: {
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  reportButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
});

export default AnalyticsScreen;