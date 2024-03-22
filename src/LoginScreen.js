import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput, Button, Title, useTheme } from 'react-native-paper';
import supabase from './supabase'; // Import your Supabase client instance

const LoginScreen = ({ setLoggedIn, setUserSession }) => {
  const theme = useTheme(); // Use the theme hook

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Check if either username or password is blank
    if (!username || !password) {
      setError('Username and password cannot be empty.');
      return;
    }

    try {
      setLoading(true); // Set loading to true when the login process starts

      const { data, error } = await supabase
        .from('InventoryUsers')
        .select('*')
        .eq('User_Name', username)
        .eq('User_Password', password)
        .single();

      if (error) {
        console.log('Error fetching user data:', error);
        setError('Invalid credentials. Please try again.');
      } else if (data && data.User_ID !== '') {
        setLoggedIn(true);
        setUserSession(data.User_ID); // Convert User_ID to string
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false); // Set loading back to false after the login process
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>A2K Equipment Handover</Title>
      <View style={styles.formContainer}>
        <TextInput
          mode='flat'
          label='Username'
          value={username}
          onChangeText={(text) => setUsername(text)}
          style={styles.input}
        />
        <TextInput
          label='Password'
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!showPassword}
          style={styles.input}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          mode='contained'
          onPress={handleLogin}
          style={styles.loginButton}
          disabled={loading} // Disable the button when loading is true
          loading={loading} // Show loading indicator when loading is true
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Background color of the container
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    color: '#333', // Title color
  },
  formContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: '#FFF', // Background color of the form container
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  loginButton: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
});

export default LoginScreen;
