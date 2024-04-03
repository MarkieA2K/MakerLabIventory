import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTheme, Button, Avatar, Modal, Portal } from 'react-native-paper';

const SettingsScreen = ({ setLoggedIn, setSessionUser, userData }) => {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const handleLogout = () => {
    // Show confirmation modal before logging out
    setConfirmModalVisible(true);
  };

  const confirmLogout = () => {
    // Implement your logout logic here
    // For simplicity, set loggedIn to false
    setLoggedIn(false);
    setSessionUser('');
    setConfirmModalVisible(false);
  };

  const cancelLogout = () => {
    setConfirmModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Avatar.Icon icon='account-circle' size={80} style={styles.avatar} />
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
        style={styles.logoutButton}
      >
        Logout
      </Button>

      {/* Confirmation Modal */}
      <Portal>
        <Modal
          visible={confirmModalVisible}
          onDismiss={() => setConfirmModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.confirmText}>
            Are you sure you want to logout?
          </Text>
          <View style={styles.modalButtons}>
            <Button onPress={cancelLogout}>Cancel</Button>
            <Button onPress={confirmLogout}>Logout</Button>
          </View>
        </Modal>
      </Portal>
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
  // Modal styles
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default SettingsScreen;
