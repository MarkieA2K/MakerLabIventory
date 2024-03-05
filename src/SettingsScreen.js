// SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, Button, Avatar } from 'react-native-paper';

const SettingsScreen = ({ setLoggedIn, setSessionUser, userData }) => {
  const theme = useTheme();

  const handleLogout = () => {
    // Implement your logout logic here
    // For simplicity, set loggedIn to false
    setLoggedIn(false);
    setSessionUser('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Avatar.Icon
          icon='account-circle'
          size={80}
          color={theme.colors.primary}
          style={styles.avatar}
        />
        {userData && (
          <View style={styles.textContainer}>
            <Text style={styles.text}>Username: {userData.User_Name}</Text>
            <Text style={styles.text}>
              Full Name: {userData.User_DisplayName}
            </Text>
            <Text style={styles.text}>User Level: {userData.User_Level}</Text>
          </View>
        )}
      </View>
      <Button
        mode='contained'
        onPress={handleLogout}
        color={theme.colors.primary}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    marginRight: 20,
  },
  textContainer: {
    justifyContent: 'center',
  },
  text: {
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default SettingsScreen;
