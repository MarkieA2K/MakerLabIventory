import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { TextInput, Button, Modal, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import supabase from './supabase'; // Import your Supabase client instance

const LoginScreen = ({ setLoggedIn, setUserSession, changeMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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
    <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
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
            style={styles.input}
          />
          <TextInput
            textColor='#EAEAEA'
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
        </LinearGradient>

        {/* Modal for Equipment Handover and Inventory Options */}
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.buttonContainer}>
              <IconButton
                icon='laptop'
                color='#1E90FF'
                size={80}
                style={[styles.modalButton, styles.handoverButton]}
                onPress={handleHandover}
              />

              <IconButton
                icon='toolbox'
                color='#32CD32'
                size={80}
                style={[styles.modalButton, styles.inventoryButton]}
                onPress={handleInventory}
              />
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242a3E', // Background color of the container
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    resizeMode: 'contain',
    width: 300,
    height: 270,
  },
  formContainer: {
    width: '100%',
    padding: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 4,
    backgroundColor: '#FFF', // Background color of the form container
  },
  input: {
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, .08)',
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
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    width: '45%',
    marginBottom: 10,
    alignItems: 'center',
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
