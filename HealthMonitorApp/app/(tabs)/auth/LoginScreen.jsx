import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { spacing, fontSizes } from '../../../utils/spacing';

const LoginScreen = ({ navigation }) => {
  const { login: handleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await handleLogin(email, password);
    } catch (err) {
      setError('Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Welcome Back</Text>
        <Input
          placeholder="Email"
          leftIcon={<Icon name="email" type="material" />}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <Input
          placeholder="Password"
          leftIcon={<Icon name="lock" type="material" />}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Login" onPress={onLogin} containerStyle={styles.button} />
        <Button
          title="Forgot Password?"
          type="clear"
          onPress={() => navigation.navigate('ForgotPassword')}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  error: { color: '#F44336', marginBottom: 10, textAlign: 'center' },
  button: { marginTop: 10 },
});

export default LoginScreen;
