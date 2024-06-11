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
import { Image, StyleSheet } from 'react-native';

import LoginScreen from './src/LoginScreen';
import LaptopScreen from './src/LaptopScreen';
import ReturnScreen from './src/ReturnScreen';
import supabase from './src/supabase';
import LaptopLogScreen from './src/LaptopLogScreen';
import RequestScreen from './src/RequestScreen';
import InventoryScreen from './src/InventoryScreen';
import LogScreen from './src/LogScreen';
import DashboardScreen from './src/Dashboard';

const Tab = createBottomTabNavigator();

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#606060', // your primary colorAdmin
    primaryContainer: '#A9A9A9',
    accent: '#FF4081', // your accent color
    background: '#242A3E', // your background color
    surface: '#4D4646', // your surface color
    error: '#FF0000', // your error color
    text: '#333333', // your text color
    onSurface: '#000000', // your color of text on surfaces
    onSurfaceVariant: '#707070',
    disabled: '#CCCCCC', // your disabled state color
    surfaceDisabled: 'rgba(255, 255, 255, 0.7)',
    placeholder: '#CCCCCC', // your placeholder text color
    backdrop: 'rgba(0, 0, 0, 0.5)', // your backdrop color for modals
    notification: '#FFA500', // your notification color
    backgroundGradient1: '#242A3E',
    backgroundGradient2: '#191D2B',
    backgroundGradient3: '#0F1016',
  },
};
const App = () => {
  const [loggedIn, setLoggedIn] = useState(false); // bootleg login token
  const [sessionUser, setSessionUser] = useState(''); // User_ID of logged in user
  const [welcomeModalVisible, setWelcomeModalVisible] = useState(false); //new modal of welcome message
  const [userData, setUserData] = useState(''); // full data of user
  const [approveNumber, setApproveNumber] = useState(null);
  const [userMode, setUserMode] = useState(null);
  const setUserSession = (userDisplayName) => {
    // Get Display name for welcome message
    userDisplayName.toString();
    setSessionUser(userDisplayName);
    console.log(userDisplayName);
  };

  const changeMode = (mode) => {
    setUserMode(mode);
    console.log(mode);
  };

  const updateApproveNumber = (newNumber) => {
    setApproveNumber(newNumber);
  };

  const fetchRequestData = async () => {
    try {
      const { data, error } = await supabase
        .from('InventoryRequest')
        .select('*');

      if (error) {
        console.error('Error refreshing request data:', error);
        Alert.alert('Error', 'Failed to refresh request data');
      } else {
        setApproveNumber(data.length);
      }
    } catch (error) {
      console.error('Error refreshing request data:', error.message);
      Alert.alert('Error', 'Failed to refresh request data');
    } finally {
      console.log('Finally app.js');
    }
  };

  useEffect(() => {
    //Run when loaded
    if (loggedIn && sessionUser) {
      const fetchUserData = async () => {
        try {
          const { data, error } = await supabase //load data from database
            .from('InventoryUsers')
            .select('*')
            .eq('User_ID', sessionUser.toString()); //WHERE User_ID == sesstionUser

          if (error) {
            //error message
            console.error('Error fetching user data:', error);
          } else if (data && data.length > 0) {
            // ?????
            setUserData(data[0]);
            setWelcomeModalVisible(true);
          }
        } catch (error) {
          console.error('Error fetching user data:', error.message);
        }
      };

      fetchUserData();
    }
  }, [loggedIn]);
  useEffect(() => {
    fetchRequestData();
  }, [loggedIn]);

  const closeWelcomeModal = () => {
    setWelcomeModalVisible(false);
  };

  // Function to check admin status based on user data
  const isAdmin = () => {
    return userData?.User_Level === 'ADMIN';
  };

  const isOJT = () => {
    return userData?.User_Level === 'OJT';
  };

  return (
    <PaperProvider theme={customTheme}>
      <NavigationContainer>
        {loggedIn ? (
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                position: 'absolute',
                elevation: 0,
                marginHorizontal: 17,
                height: 95,
                bottom: 10,
                borderRadius: 50,
                backgroundColor: '#333333', // Corrected background color

                padding: 20,
                paddingBottom: 10,
                paddingHorizontal: 10,
              },
              tabBarActiveTintColor: '#FFD911',
              tabBarInactiveTintColor: '#EAEAEA',
              tabBarLabelStyle: {
                fontSize: 15, // Adjust the font size of the label
                textAlign: 'center', // Center align the label text
                marginBottom: 5, // Add margin to the bottom of the label
              },
              tabBarIconStyle: {
                width: 60, // Adjust the width of the icon
                height: 60, // Adjust the height of the icon
              },
            }}
          >
            {userMode === 'Handover' && (
              <>
                <Tab.Screen
                  name='Equipment'
                  children={() => (
                    <LaptopScreen
                      changeMode={changeMode}
                      userData={userData}
                      setLoggedIn={setLoggedIn}
                      setSessionUser={setSessionUser}
                    />
                  )}
                  options={{
                    tabBarIcon: ({ color, size }) => (
                      <List.Icon color={color} icon='laptop' size={size} />
                    ),
                  }}
                />
                <Tab.Screen
                  name='Return'
                  children={() => (
                    <ReturnScreen
                      changeMode={changeMode}
                      userData={userData}
                      setLoggedIn={setLoggedIn}
                      setSessionUser={setSessionUser}
                    />
                  )}
                  options={{
                    tabBarIcon: ({ color, size }) => (
                      <List.Icon color={color} icon='arrow-left' size={size} />
                    ),
                  }}
                />

                {isAdmin() && (
                  <Tab.Screen
                    name='Approve'
                    children={() => (
                      <RequestScreen
                        changeMode={changeMode}
                        userData={userData}
                        updateApproveNumber={updateApproveNumber}
                        setLoggedIn={setLoggedIn}
                        setSessionUser={setSessionUser}
                      />
                    )}
                    options={{
                      tabBarIcon: ({ color, size }) => (
                        <List.Icon color={color} icon='send' size={size} />
                      ),
                      tabBarBadge: approveNumber > 0 ? approveNumber : null,
                    }}
                  />
                )}
                {isAdmin() && (
                  <Tab.Screen
                    name='Log'
                    component={LaptopLogScreen}
                    options={{
                      headerShown: true,
                      tabBarIcon: ({ color, size }) => (
                        <List.Icon color={color} icon='history' size={size} />
                      ),
                      headerStyle: {
                        backgroundColor: '#333333', // Set background color if needed
                      },
                      headerTitleStyle: {
                        fontWeight: 'bold', // Customize header title style if needed
                        color: 'white',
                        padding: 8,
                      },
                    }}
                  />
                )}
                {isOJT() && (
                  <Tab.Screen
                    name='Requests'
                    children={() => (
                      <RequestScreen
                        changeMode={changeMode}
                        userData={userData}
                        setLoggedIn={setLoggedIn}
                        setSessionUser={setSessionUser}
                      />
                    )}
                    options={{
                      tabBarIcon: ({ color, size }) => (
                        <List.Icon color={color} icon='send' size={size} />
                      ),
                    }}
                  />
                )}
              </>
            )}
            {userMode === 'Inventory' && (
              <>
                {/* Add Tab.Screen components for Inventory mode */}
                <Tab.Screen
                  name='Dashboard'
                  children={() => (
                    <DashboardScreen
                      changeMode={changeMode}
                      userData={userData}
                      setLoggedIn={setLoggedIn}
                      setSessionUser={setSessionUser}
                    />
                  )}
                  options={{
                    tabBarIcon: ({ color, size }) => (
                      <List.Icon
                        color={color}
                        icon='view-dashboard'
                        size={size}
                      />
                    ),
                  }}
                />
                <Tab.Screen
                  name='Inventory'
                  children={() => (
                    <InventoryScreen
                      changeMode={changeMode}
                      userData={userData}
                      setLoggedIn={setLoggedIn}
                      setSessionUser={setSessionUser}
                    />
                  )}
                  options={{
                    tabBarIcon: ({ color, size }) => (
                      <List.Icon color={color} icon='archive' size={size} />
                    ),
                  }}
                />
                {/* Add LogScreen component */}
                <Tab.Screen
                  name='Log'
                  children={() => (
                    <LogScreen
                      changeMode={changeMode}
                      userData={userData}
                      setLoggedIn={setLoggedIn}
                      setSessionUser={setSessionUser}
                    />
                  )}
                  options={{
                    tabBarIcon: ({ color, size }) => (
                      <List.Icon color={color} icon='history' size={size} />
                    ),
                  }}
                />
                {/* Add more screens as needed for Inventory mode */}
              </>
            )}
          </Tab.Navigator>
        ) : (
          <LoginScreen
            setLoggedIn={setLoggedIn}
            setUserSession={setUserSession}
            changeMode={changeMode}
          />
        )}
      </NavigationContainer>

      <Portal>
        <Modal
          visible={welcomeModalVisible}
          onDismiss={closeWelcomeModal}
          contentContainerStyle={styles.modalContent}
        >
          <Image
            style={styles.tinyLogo}
            source={require('./assets/A2K-LOGO.png')}
          />
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
    marginTop: 20,
    fontSize: 18,
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 10,
  },
  tinyLogo: {
    width: 170,
    height: 80,
  },
};

export default App;
