import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { spacing, fontSizes } from '../../../utils/spacing';

const RegisterScreen = ({ navigation }) => {
  const { register: handleRegister } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onRegister = async () => {
    setLoading(true);
    setError('');
    try {
      await handleRegister({ email, password, name, company });
    } catch (err) {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Create Account</Text>
        <Input
          placeholder="Full Name"
          leftIcon={<Icon name="person" type="material" />}
          value={name}
          onChangeText={setName}
        />
        <Input
          placeholder="Company"
          leftIcon={<Icon name="business" type="material" />}
          value={company}
          onChangeText={setCompany}
        />
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
        <Button title="Register" onPress={onRegister} containerStyle={styles.button} />
        <Button
          title="Already have an account? Log in"
          type="clear"
          onPress={() => navigation.navigate('Login')}
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

export default RegisterScreen;
