import React, { useState } from 'react';
import { spacing, fontSizes } from '../../../utils/spacing';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import LoadingSpinner from '../../../components/LoadingSpinner';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    setLoading(true);
    try {
      // TODO: Add your API call here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate
      setMessage('If your email exists, a reset link has been sent.');
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Forgot Password</Text>
        <Input
          placeholder="Enter your email"
          leftIcon={<Icon name="email" type="material" />}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Button title="Reset Password" onPress={handleReset} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  message: { marginBottom: 15, color: '#777', textAlign: 'center' },
});

export default ForgotPasswordScreen;
