// ExportScreen.js
import React from 'react';
import { Modal, ScrollView, StyleSheet } from 'react-native';
import { DataTable, Button } from 'react-native-paper';

const ExportScreen = ({ logData, closeModal }) => {
  return (
    <Modal visible={true} onRequestClose={closeModal}>
      <ScrollView>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Laptop Name</DataTable.Title>
            <DataTable.Title>User</DataTable.Title>
            <DataTable.Title>Sign Out</DataTable.Title>
            <DataTable.Title>Sign In</DataTable.Title>
          </DataTable.Header>

          {logData.map((item) => (
            <DataTable.Row key={item.LaptopLog_ID}>
              <DataTable.Cell>{item.Laptop_Name}</DataTable.Cell>
              <DataTable.Cell>{item.Laptop_User}</DataTable.Cell>
              <DataTable.Cell>{item.Laptop_SignOut}</DataTable.Cell>
              <DataTable.Cell>{item.Laptop_SignIn}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>

        <Button onPress={closeModal} style={styles.closeButton}>
          Close
        </Button>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    marginTop: 8,
  },
});

export default ExportScreen;
