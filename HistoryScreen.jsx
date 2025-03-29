import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Modern way to handle default props
const TextElement = ({ 
  children = '', 
  style = {},
  // add other props with defaults here
}) => {
  return <Text style={style}>{children}</Text>;
};

const HistoryScreen = () => {
  return (
    <View style={styles.container}>
      <TextElement>Your History</TextElement>
      {/* Rest of your history screen content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default HistoryScreen; 