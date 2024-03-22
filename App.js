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

import { CalendarProvider } from 'react-native-calendars';
import SettingsScreen from './src/SettingsScreen';
import LoginScreen from './src/LoginScreen';
import LaptopScreen from './src/LaptopScreen';
import ReturnScreen from './src/ReturnScreen';
import supabase from './src/supabase';
import LaptopLogScreen from './src/LaptopLogScreen';
import RequestScreen from './src/RequestScreen';
import LaptopRequestScreen from './src/LaptopRequestScreen';
import BookingScreen from './src/BookingScreen';

const Tab = createBottomTabNavigator();

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#606060', // your primary color
    primaryContainer: '#A9A9A9',
    accent: '#FF4081', // your accent color
    background: '#F7F7F7', // your background color
    surface: '#FFFFFF', // your surface color
    error: '#FF0000', // your error color
    text: '#333333', // your text color
    onSurface: '#000000', // your color of text on surfaces
    disabled: '#A9A9A9', // your disabled state color
    placeholder: '#CCCCCC', // your placeholder text color
    backdrop: 'rgba(0, 0, 0, 0.5)', // your backdrop color for modals
    notification: '#FFA500', // your notification color
  },
};
const App = () => {
  const [loggedIn, setLoggedIn] = useState(false); // bootleg login token
  const [sessionUser, setSessionUser] = useState(''); // User_ID of logged in user
  const [welcomeModalVisible, setWelcomeModalVisible] = useState(false); //new modal of welcome message
  const [userData, setUserData] = useState(null); // full data of user
  const [approveNumber, setApproveNumber] = useState(null);

  const setUserSession = (userDisplayName) => {
    // Get Display name for welcome message
    userDisplayName.toString();
    setSessionUser(userDisplayName);
    console.log(userDisplayName);
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
      fetchRequestData();
      fetchUserData();
    }
  }, [loggedIn, sessionUser]);
  useEffect(() => {
    fetchRequestData();
  }, [approveNumber]);

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
          <Tab.Navigator>
            {/* <Tab.Screen
              name='Request'
              children={() => <LaptopRequestScreen userData={userData} />}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <List.Icon color={color} icon='laptop' size={size} />
                ),
              }}
            /> */}

            <Tab.Screen
              name='Equipment'
              children={() => <LaptopScreen userData={userData} />}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <List.Icon color={color} icon='laptop' size={size} />
                ),
              }}
            />

            {/* <Tab.Screen
              name='Equipment'
              component={LaptopScreen} // Render the LaptopScreen component directly
              initialParams={{ userData: userData }} // Pass props via initialParams
              options={{
                tabBarIcon: ({ color, size }) => (
                  <List.Icon color={color} icon='laptop' size={size} />
                ),
              }}
            /> */}

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
            {isAdmin() && (
              <Tab.Screen
                name='Booking'
                children={() => <BookingScreen userData={userData} />}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <List.Icon color={color} icon='history' size={size} />
                  ),
                  //    headerShown: false, // Add this line to hide the header
                }}
              />
            )}
            {/* {isAdmin() && (
              <Tab.Screen
                name='Approve'
                children={() => <RequestScreen userData={userData} />}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <List.Icon color={color} icon='send' size={size} />
                  ),
                }}
              />
            )} */}

            {isAdmin() && (
              <Tab.Screen
                name='Approve'
                children={() => (
                  <RequestScreen
                    userData={userData}
                    updateApproveNumber={updateApproveNumber}
                  />
                )}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <List.Icon color={color} icon='send' size={size} />
                  ),
                  // Conditionally render tabBarBadge if approveNumber is more than zero
                  tabBarBadge: approveNumber > 0 ? approveNumber : null,
                }}
              />
            )}
            {isOJT() && (
              <Tab.Screen
                name='Requests'
                children={() => <RequestScreen userData={userData} />}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <List.Icon color={color} icon='send' size={size} />
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
