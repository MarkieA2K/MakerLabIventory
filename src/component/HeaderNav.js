import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons'; // Assuming you are using Expo
import { MaterialIcons } from '@expo/vector-icons';

const Header = ({ userData, setLoggedIn }) => {
  const [viewSettings, setViewSettings] = useState(false);

  const confirmLogout = () => {
    setLoggedIn(false);
    setViewSettings(false); // Close settings modal after confirming logout
  };

  const modalVisible = () => {
    setViewSettings(true);
  };

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <View style={styles.userInfo}>
          <Text style={[styles.userLevel, { color: '#EAEAEA' }]}>
            {userData.User_Level}
          </Text>
          <Text style={[styles.userName, { color: '#EAEAEA' }]}>
            {userData.User_DisplayName}
          </Text>
        </View>
        <TouchableOpacity onPress={modalVisible} style={styles.settingsButton}>
          <MaterialIcons name='manage-accounts' size={40} color='white' />
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <Modal
        animationType='fade' // Change animation to fade
        transparent={true}
        visible={viewSettings}
        onRequestClose={() => setViewSettings(false)}
        onDismiss={() => setViewSettings(false)}
      >
        <View style={[styles.centeredView, styles.modalOverlay]}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Settings Modal</Text>
            <Button
              onPress={confirmLogout}
              mode='contained'
              style={styles.logoutButton}
            >
              Logout
            </Button>
            <Button
              onPress={() => setViewSettings(false)}
              mode='outlined'
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute', // or 'fixed' if you want it fixed to the viewport
    top: 30, // Adjust as needed
    left: 0, // Adjust as needed
    right: 0, // Adjust as needed
    zIndex: 1000, // Adjust the zIndex to ensure it appears above other content
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#333333',
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userLevel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
  },
  settingsButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginTop: 70, // Adjust as needed
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
    minWidth: 200, // Adjust as needed
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  logoutButton: {
    marginVertical: 5,
    borderRadius: 10,
  },
  cancelButton: {
    marginVertical: 5,
    borderRadius: 10,
  },
});

export default Header;
