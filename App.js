// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Provider as PaperProvider,
  DefaultTheme,
  Text,
  Portal,
  Modal,
  Button,
} from 'react-native-paper';
import InventoryScreen from './src/InventoryScreen';

import SettingsScreen from './src/SettingsScreen';
import LoginScreen from './src/LoginScreen';
import LaptopScreen from './src/LaptopScreen'; // Import LaptopScreen
import ReturnScreen from './src/ReturnScreen';
import supabase from './src/supabase';

const Tab = createBottomTabNavigator();

const grayscaleTheme = {
  ...DefaultTheme,
  colors: {
    primary: '#333333', // Dark gray
    accent: '#666666', // Medium gray
    background: '#ffffff', // White background
    // ... other color settings
  },
};

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [sessionUser, setSessionUser] = useState('');
  const [welcomeModalVisible, setWelcomeModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);

  const setUserSession = (userDisplayName) => {
    userDisplayName.toString();
    setSessionUser(userDisplayName);
    console.log(userDisplayName);
  };

  useEffect(() => {
    if (loggedIn && sessionUser) {
      // Fetch user data using User_ID
      const fetchUserData = async () => {
        try {
          const { data, error } = await supabase
            .from('InventoryUsers')
            .select('*')
            .eq('User_ID', sessionUser.toString()); // Convert sessionUser to string

          if (error) {
            console.error('Error fetching user data:', error);
          } else if (data && data.length > 0) {
            setUserData(data[0]);
            setWelcomeModalVisible(true);
          }
        } catch (error) {
          console.error('Error fetching user data:', error.message);
        }
      };

      fetchUserData();
    }
  }, [loggedIn, sessionUser]);

  const logoutHandler = () => {};
  const closeWelcomeModal = () => {
    setWelcomeModalVisible(false);
  };

  return (
    <PaperProvider theme={grayscaleTheme}>
      <NavigationContainer>
        {loggedIn ? (
          <Tab.Navigator>
            <Tab.Screen name='Inventory' component={InventoryScreen} />
            <Tab.Screen
              name='Laptops'
              children={() => <LaptopScreen userData={userData} />}
            />
            <Tab.Screen
              name='Return'
              children={() => <ReturnScreen userData={userData} />}
            />

            <Tab.Screen
              name='User'
              children={() => (
                <SettingsScreen
                  setLoggedIn={setLoggedIn}
                  setSessionUser={setSessionUser}
                />
              )}
            />
          </Tab.Navigator>
        ) : (
          <LoginScreen
            setLoggedIn={setLoggedIn}
            setUserSession={setUserSession}
          />
        )}
      </NavigationContainer>

      <Portal>
        <Modal
          visible={welcomeModalVisible}
          onDismiss={closeWelcomeModal}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalText}>{`Welcome, ${
            userData ? userData.User_DisplayName : ''
          }!`}</Text>
          <Button
            mode='contained'
            onPress={closeWelcomeModal}
            style={styles.modalButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>
    </PaperProvider>
  );
};

const styles = {
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 10,
  },
};

export default App;
