
// screens/patient/LogEntryScreen.js
import { spacing, fontSizes } from '../../../utils/spacing';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Button, Icon, Slider } from 'react-native-elements';
import { getWatchDetails, submitLogEntry } from '../../../api/patientService';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import * as ImagePicker from 'expo-image-picker';

const LogEntryScreen = ({ route, navigation }) => {
  const { watchId } = route.params;
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [watchDetails, setWatchDetails] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [feeling, setFeeling] = useState(3); // 1-5 scale

  // Fetch watch details
  useEffect(() => {
    const loadWatchDetails = async () => {
      try {
        const details = await getWatchDetails(watchId);
        setWatchDetails(details);
        // Pre-populate with last value if exists
        if (details.lastLogValue) {
          setInputValue(details.lastLogValue.toString());
        }
      } catch (error) {
        console.error('Error loading watch details:', error);
        Alert.alert('Error', 'Failed to load watch details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadWatchDetails();
  }, [watchId]);

  // Permission for accessing camera/gallery
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to attach photos.');
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    // Validate input
    if (!inputValue.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }

    // Check if value is within expected range
    const numValue = parseFloat(inputValue);
    if (watchDetails.minValue !== undefined && watchDetails.maxValue !== undefined) {
      if (numValue < watchDetails.minValue || numValue > watchDetails.maxValue) {
        Alert.alert(
          'Unusual Value',
          `The value you entered (${numValue}) is outside the normal range (${watchDetails.minValue}-${watchDetails.maxValue}). Are you sure this is correct?`,
          [
            { text: "No, I'll Change It", style: 'cancel' },
            { text: 'Yes, Submit Anyway', onPress: () => submitLog() }
          ]
        );
        return;
      }
    }

    submitLog();
  };

  const submitLog = async () => {
    try {
      setSubmitting(true);
      
      const logData = {
        watchId,
        patientId: userData.id,
        value: parseFloat(inputValue),
        unit: watchDetails.unit,
        notes,
        feeling,
        image: image ? image : null,
        timestamp: new Date().toISOString()
      };
      
      await submitLogEntry(logData);
      
      Alert.alert(
        'Success',
        'Your health data has been logged successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error submitting log:', error);
      Alert.alert('Error', 'Failed to submit your log. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const feelingLabels = ['Very Bad', 'Bad', 'Okay', 'Good', 'Very Good'];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{watchDetails.name}</Text>
          <Text style={styles.subtitle}>Daily Log Entry</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>
            Enter your {watchDetails.name.toLowerCase()} ({watchDetails.unit})
          </Text>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={`Enter value in ${watchDetails.unit}`}
            keyboardType="numeric"
            returnKeyType="done"
          />
          
          {watchDetails.normalRange && (
            <Text style={styles.normalRange}>
              Normal range: {watchDetails.normalRange}
            </Text>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>How are you feeling today?</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>{feelingLabels[feeling - 1]}</Text>
            <Slider
              value={feeling}
              onValueChange={(value) => setFeeling(value)}
              minimumValue={1}
              maximumValue={5}
              step={1}
              thumbStyle={styles.sliderThumb}
              trackStyle={styles.sliderTrack}
              minimumTrackTintColor="#2196F3"
              thumbTintColor="#2196F3"
              style={styles.slider}
            />
            <View style={styles.sliderLabelsContainer}>
              <Text style={styles.sliderMinLabel}>Poor</Text>
              <Text style={styles.sliderMaxLabel}>Excellent</Text>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any relevant information here..."
            multiline
            textAlignVertical="top"
            numberOfLines={4}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Attach Photo (Optional)</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Icon name="image" type="material" color="#2196F3" size={24} />
            <Text style={styles.imagePickerText}>
              {image ? 'Change Image' : 'Select Image'}
            </Text>
          </TouchableOpacity>
          
          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <Icon name="close" type="material" color="#fff" size={18} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Submit Log"
            onPress={handleSubmit}
            buttonStyle={styles.submitButton}
            titleStyle={styles.submitButtonText}
            loading={submitting}
            disabled={submitting}
            icon={
              <Icon
                name="check"
                type="material"
                color="#FFFFFF"
                size={20}
                style={{ marginRight: 10 }}
              />
            }
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  normalRange: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  sliderContainer: {
    marginVertical: 10,
  },
  sliderLabel: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    color: '#2196F3',
    marginBottom: 10,
  },
  slider: {
    height: 40,
  },
  sliderThumb: {
    height: 20,
    width: 20,
    backgroundColor: '#2196F3',
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
  },
  sliderLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderMinLabel: {
    fontSize: 12,
    color: '#888',
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: '#888',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  imagePickerText: {
    marginLeft: 10,
    color: '#2196F3',
    fontSize: 16,
  },
  imagePreviewContainer: {
    marginTop: 15,
    position: 'relative',
    alignSelf: 'center',
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ff5252',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LogEntryScreen;
