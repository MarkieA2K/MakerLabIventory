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
  List,
} from 'react-native-paper';
import InventoryScreen from './src/InventoryScreen';
import SettingsScreen from './src/SettingsScreen';
import LoginScreen from './src/LoginScreen';
import LaptopScreen from './src/LaptopScreen';
import ReturnScreen from './src/ReturnScreen';
import supabase from './src/supabase';
import LaptopLogScreen from './src/LaptopLogScreen';

const Tab = createBottomTabNavigator();

const customTheme = {
  ...DefaultTheme,
  colors: {
    primary: '#689F38', // Light green (adjust the color as needed)
    accent: '#BDBDBD', // Light gray
    background: '#E2E2E2', // White background
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
      const fetchUserData = async () => {
        try {
          const { data, error } = await supabase
            .from('InventoryUsers')
            .select('*')
            .eq('User_ID', sessionUser.toString());

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

  const closeWelcomeModal = () => {
    setWelcomeModalVisible(false);
  };

  // Function to check admin status based on user data
  const isAdmin = () => {
    return userData?.User_Level === 'ADMIN';
  };

  return (
    <PaperProvider theme={customTheme}>
      <NavigationContainer>
        {loggedIn ? (
          <Tab.Navigator>
            <Tab.Screen
              name='Inventory'
              component={InventoryScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <List.Icon color={color} icon='clipboard' size={size} />
                ),
              }}
            />
            <Tab.Screen
              name='Laptops'
              children={() => <LaptopScreen userData={userData} />}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <List.Icon color={color} icon='laptop' size={size} />
                ),
              }}
            />
            <Tab.Screen
              name='Return'
              children={() => <ReturnScreen userData={userData} />}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <List.Icon color={color} icon='arrow-left' size={size} />
                ),
              }}
            />
            {isAdmin() && (
              <Tab.Screen
                name='Log'
                component={LaptopLogScreen}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <List.Icon color={color} icon='history' size={size} />
                  ),
                }}
              />
            )}
            <Tab.Screen
              name='User'
              children={() => (
                <SettingsScreen
                  userData={userData}
                  setLoggedIn={setLoggedIn}
                  setSessionUser={setSessionUser}
                />
              )}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <List.Icon color={color} icon='account' size={size} />
                ),
              }}
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
