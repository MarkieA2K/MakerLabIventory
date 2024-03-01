// LoginScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, useTheme } from 'react-native-paper';
import supabase from './supabase'; // Import your Supabase client instance

const LoginScreen = ({ setLoggedIn, setUserSession }) => {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Check if either username or password is blank
    if (!username || !password) {
      Alert.alert('Error', 'Username and password cannot be empty.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('InventoryUsers')
        .select('*')
        .eq('User_Name', username)
        .eq('User_Password', password)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Invalid credentials. Please try again.');
      } else if (data && data.User_ID !== '') {
        setLoggedIn(true);
        setUserSession(data.User_ID); // Convert User_ID to string
      } else {
        Alert.alert('Error', 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>A2K Inventory</Title>
      <View style={styles.formContainer}>
        <TextInput
          label='Username'
          value={username}
          onChangeText={(text) => setUsername(text)}
          style={styles.input}
          theme={{
            colors: {
              primary: theme.colors.text,
            },
          }}
        />
        <TextInput
          label='Password'
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!showPassword}
          style={styles.input}
          theme={{
            colors: {
              primary: theme.colors.text,
            },
          }}
          right={
            <TextInput.Icon
              name={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        <Button
          mode='contained'
          onPress={handleLogin}
          style={styles.loginButton}
          theme={{ colors: { primary: theme.colors.primary } }}
        >
          Login
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
    backgroundColor: '#ECF0F1', // Light gray background
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: '#34495E', // Dark grayish blue text
  },
  formContainer: {
    width: '80%',
    backgroundColor: '#ffffff', // White background for the form container
    padding: 16,
    borderRadius: 8,
    elevation: 4, // Add elevation for a subtle shadow
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff', // Solid white background
    borderWidth: 1, // Border width
    borderColor: '#BDC3C7', // Border color (light gray)
    borderRadius: 4, // Border radius
    paddingHorizontal: 12, // Horizontal padding
  },
  loginButton: {
    marginTop: 16,
    backgroundColor: '#2C3E50', // Dark grayish blue
  },
});

export default LoginScreen;
