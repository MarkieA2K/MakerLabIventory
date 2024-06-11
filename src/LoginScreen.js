import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import {
  TextInput,
  Button,
  Modal,
  IconButton,
  Checkbox,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from './supabase'; // Import your Supabase client instance

const LoginScreen = ({ setLoggedIn, setUserSession, changeMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [userLevel, setUserLevel] = useState(null);
  const [checked, setChecked] = useState(false);

  const getStoredCredentials = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      const storedPassword = await AsyncStorage.getItem('password');
      if (storedUsername && storedPassword) {
        setUsername(storedUsername);
        setPassword(storedPassword);
        setChecked(true);
      }
    } catch (error) {
      console.error('Error retrieving stored credentials:', error.message);
    }
  };
  useEffect(() => {
    getStoredCredentials();
  }, []);

  const handleLogin = async () => {
    Keyboard.dismiss();
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
        if (checked) {
          // Store username and password in AsyncStorage
          await AsyncStorage.setItem('username', username);
          await AsyncStorage.setItem('password', password);
        } else {
          // Remove stored username and password from AsyncStorage
          await AsyncStorage.removeItem('username');
          await AsyncStorage.removeItem('password');
        }
        console.log('tama account');
        setModalVisible(true);
        // setLoggedIn(true);
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

  const handleHandover = () => {
    setLoggedIn(true);
    changeMode('Handover');
  };

  const handleInventory = () => {
    setLoggedIn(true);
    changeMode('Inventory');

    // Implement logic for inventory option
  };

  return (
    <View style={styles.content}>
      <Image source={require('../assets/A2K-LOGO.png')} style={styles.icon} />
      <LinearGradient
        colors={['#191D2B', '#0F1016']}
        style={styles.formContainer}
      >
        <TextInput
          textColor='#EAEAEA'
          mode='flat'
          label='Username'
          value={username}
          onChangeText={(text) => setUsername(text)}
          onFocus={() => setError('')}
          style={styles.input}
        />
        <TextInput
          textColor='#EAEAEA'
          label='Password'
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!showPassword}
          style={styles.input}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#707070' }}>Remember Credentials? </Text>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={() => {
              setChecked(!checked);
            }}
          />
        </View>
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
      </LinearGradient>

      {/* Modal for Equipment Handover and Inventory Options */}
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.buttonContainer}>
            <View style={styles.felxcolumn}>
              <IconButton
                icon='laptop'
                size={100}
                style={[styles.modalButton, styles.handoverButton]}
                onPress={handleHandover}
              />
              <Text>Handover</Text>
            </View>
            <View style={styles.felxcolumn}>
              <IconButton
                icon='toolbox'
                size={100}
                style={[styles.modalButton, styles.inventoryButton]}
                onPress={handleInventory}
              />
              <Text>Inventory</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242a3E', // Background color of the container
  },
  felxcolumn: { alignItems: 'center', marginHorizontal: 20 },
  content: {
    backgroundColor: '#242a3E',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    borderWidth: 1,

    resizeMode: 'contain',
    width: 300,
    height: 270,
  },
  formContainer: {
    alignItems: 'center',
    width: '95%',
    padding: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 4,
    backgroundColor: '#FFF', // Background color of the form container
  },
  input: {
    marginVertical: 7,
    backgroundColor: 'rgba(255, 255, 255, .08)',
    width: '100%',
  },
  loginButton: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    height: 300,
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  modalButton: {
    marginBottom: 10,

    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 2,
  },
  handoverButton: {
    backgroundColor: '#1E90FF', // Adjust color as needed
  },
  inventoryButton: {
    backgroundColor: '#32CD32', // Adjust color as needed
  },
});

export default LoginScreen;
