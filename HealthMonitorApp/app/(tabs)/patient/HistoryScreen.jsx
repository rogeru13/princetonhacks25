
// screens/patient/HistoryScreen.js
import { spacing, fontSizes } from '../../../utils/spacing';
import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, ScrollView } from 'react-native';
import { ButtonGroup, Icon, Divider } from 'react-native-elements';
import { fetchPatientHistory } from '../../../api/patientService';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { LineChart } from 'react-native-chart-kit';

const HistoryScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedWatch, setSelectedWatch] = useState(null);
  const [history, setHistory] = useState([]);
  const [watches, setWatches] = useState([]);
  const [timeRange, setTimeRange] = useState(1); // 0: Week, 1: Month, 2: 3 Months
  const [viewMode, setViewMode] = useState(0); // 0: List, 1: Chart

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        
        // Get the range based on selection
        let startDate;
        const today = new Date();
        
        if (timeRange === 0) {
          // Week
          startDate = startOfWeek(today);
        } else if (timeRange === 1) {
          // Month
          startDate = startOfMonth(today);
        } else {
          // 3 Months
          startDate = subDays(today, 90);
        }
        
        const historyData = await fetchPatientHistory(
          userData.id, 
          startDate.toISOString(),
          today.toISOString()
        );
        
        // Extract unique watches
        const uniqueWatches = [...new Set(historyData.map(item => item.watchId))];
        const watchesInfo = uniqueWatches.map(watchId => {
          const watch = historyData.find(item => item.watchId === watchId);
          return {
            id: watchId,
            name: watch.watchName
          };
        });
        
        setWatches(watchesInfo);
        
        // If no watch is selected, select the first one
        if (!selectedWatch && watchesInfo.length > 0) {
          setSelectedWatch(watchesInfo[0].id);
        }
        
        // Organize data by date for section list
        const groupedByDate = historyData.reduce((acc, log) => {
          const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(log);
          return acc;
        }, {});
        
        const sections = Object.keys(groupedByDate)
          .sort((a, b) => new Date(b) - new Date(a))
          .map(date => ({
            title: date,
            data: groupedByDate[date]
          }));
        
        setHistory(sections);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [timeRange]);

  const filteredData = selectedWatch 
    ? history.map(section => ({
        ...section,
        data: section.data.filter(item => item.watchId === selectedWatch)
      })).filter(section => section.data.length > 0)
    : history;

  const chartData = selectedWatch ? {
    labels: filteredData.slice(0, 7).map(section => 
      format(new Date(section.title), 'MM/dd')
    ).reverse(),
    datasets: [
      {
        data: filteredData.slice(0, 7).map(section => {
          // Average if multiple entries per day
          const values = section.data.map(item => parseFloat(item.value));
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        }).reverse(),
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2
      }
    ]
  } : { labels: [], datasets: [{ data: [] }] };
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health History</Text>
        
        <ButtonGroup
          buttons={['Week', 'Month', '3 Months']}
          selectedIndex={timeRange}
          onPress={(selected) => setTimeRange(selected)}
          containerStyle={styles.buttonGroupContainer}
          selectedButtonStyle={styles.selectedButton}
        />
        
        <ButtonGroup
          buttons={[
            { element: () => <Icon name="list" type="material" color={viewMode === 0 ? '#fff' : '#333'} /> },
            { element: () => <Icon name="show-chart" type="material" color={viewMode === 1 ? '#fff' : '#333'} /> }
          ]}
          selectedIndex={viewMode}
          onPress={(selected) => setViewMode(selected)}
          containerStyle={styles.viewToggleContainer}
          selectedButtonStyle={styles.selectedButton}
          buttonContainerStyle={styles.iconButtonContainer}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.watchToggleContainer}
        >
          {watches.map((watch) => (
            <TouchableOpacity
              key={watch.id}
              style={[
                styles.watchToggle,
                selectedWatch === watch.id && styles.selectedWatchToggle
              ]}
              onPress={() => setSelectedWatch(watch.id)}
            >
              <Text 
                style={[
                  styles.watchToggleText,
                  selectedWatch === watch.id && styles.selectedWatchToggleText
                ]}
              >
                {watch.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <Divider />
      
      {viewMode === 0 ? (
        <SectionList
          sections={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <View style={styles.logTime}>
                <Text style={styles.logTimeText}>
                  {format(new Date(item.timestamp), 'h:mm a')}
                </Text>
              </View>
              <View style={styles.logContent}>
                <Text style={styles.logWatchName}>{item.watchName}</Text>
                <Text style={styles.logValue}>
                  {item.value} {item.unit}
                </Text>
                {item.notes && (
                  <Text style={styles.logNotes}>{item.notes}</Text>
                )}
              </View>
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
                {format(new Date(title), 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="timeline" type="material" color="#bbb" size={60} />
              <Text style={styles.emptyText}>No history found</Text>
              <Text style={styles.emptySubtext}>
                Your health logs will appear here
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.chartContainer}>
          {selectedWatch && filteredData.length > 0 ? (
            <LineChart
              data={chartData}
              width={styles.chartWidth}
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
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#2196F3"
                }
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="timeline" type="material" color="#bbb" size={60} />
              <Text style={styles.emptyText}>No data to display</Text>
              <Text style={styles.emptySubtext}>
                Log health data to see your trends
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  buttonGroupContainer: {
    marginBottom: 15,
    height: 40,
    borderRadius: 8,
    borderColor: '#e0e0e0',
  },
  selectedButton: {
    backgroundColor: '#2196F3',
  },
  viewToggleContainer: {
    width: 100,
    alignSelf: 'flex-end',
    marginBottom: 15,
    height: 40,
    borderRadius: 8,
    borderColor: '#e0e0e0',
  },
  iconButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchToggleContainer: {
    paddingBottom: 10,
  },
  watchToggle: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  selectedWatchToggle: {
    backgroundColor: '#2196F3',
  },
  watchToggleText: {
    fontSize: 14,
    color: '#333',
  },
  selectedWatchToggleText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionHeader: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  logItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logTime: {
    width: 80,
  },
  logTimeText: {
    fontSize: 14,
    color: '#888',
  },
  logContent: {
    flex: 1,
  },
  logWatchName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  logValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  logNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  chartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartWidth: {
    width: screenWidth - 40,
  },
});

export default HistoryScreen;