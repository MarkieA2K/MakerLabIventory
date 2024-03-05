import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, useTheme } from 'react-native-paper';
import supabase from './supabase'; // Import your Supabase client instance

const LoginScreen = ({ setLoggedIn, setUserSession }) => {
  const theme = useTheme(); // Use the theme hook

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Check if either username or password is blank
    if (!username || !password) {
      Alert.alert('Error', 'Username and password cannot be empty.');
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
    } finally {
      setLoading(false); // Set loading back to false after the login process
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Title style={[styles.title, { color: theme.colors.text }]}>
        A2K Inventory
      </Title>
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
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        <Button
          mode='contained'
          onPress={handleLogin}
          style={styles.loginButton}
          theme={{ colors: { primary: theme.colors.primary } }}
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
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  formContainer: {
    width: '80%',
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  loginButton: {
    marginTop: 16,
  },
});

export default LoginScreen;
