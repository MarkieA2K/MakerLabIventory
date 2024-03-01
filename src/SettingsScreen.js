// SettingsScreen.js
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme, Button } from 'react-native-paper';

const SettingsScreen = ({ setLoggedIn }) => {
  const theme = useTheme();

  const handleLogout = () => {
    // Implement your logout logic here
    // For simplicity, set loggedIn to false
    setLoggedIn(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: theme.colors.text, marginBottom: 16 }}>
        Welcome to Settings!
      </Text>
      <Button
        mode='contained'
        onPress={handleLogout}
        buttonColor={theme.colors.primary}
      >
        Logout
      </Button>
    </View>
  );
};

export default SettingsScreen;