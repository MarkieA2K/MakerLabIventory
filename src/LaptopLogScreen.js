// LaptopLogScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Modal } from 'react-native';
import {
  List,
  Title,
  Paragraph,
  TouchableRipple,
  Button,
} from 'react-native-paper';
import supabase from './supabase';
import { useFocusEffect } from '@react-navigation/native';

const LaptopLogScreen = ({ navigation }) => {
  const [logData, setLogData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchLogData();
  }, []);

  const fetchLogData = async () => {
    try {
      const { data, error } = await supabase
        .from('InventoryLaptopLog')
        .select('*')
        .order('Laptop_SignIn', { ascending: false });

      if (error) {
        console.error('Error fetching log data:', error);
      } else {
        setLogData(data);
      }
    } catch (error) {
      console.error('Error fetching log data:', error.message);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchLogData();
    }, [])
  );

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const exportToExcel = async () => {
    // Your logic to export data to Excel or Google Sheets
    // Add your code here
  };

  // Add the export button to the header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={exportToExcel}
          style={styles.exportButton}
          labelStyle={styles.exportButtonLabel}
        >
          Export
        </Button>
      ),
    });
  }, [navigation]);

  return (
    <View>
      <ScrollView>
        <List.Section>
          {logData.map((item) => (
            <TouchableRipple
              key={item.LaptopLog_ID}
              onPress={() => handleItemPress(item)}
            >
              <List.Item
                title={item.Laptop_Name}
                description={`Borrowed by ${item.Laptop_User}`}
                left={(props) => <List.Icon {...props} icon='laptop' />}
                right={() => (
                  <View style={styles.rightContent}>
                    <Paragraph>{formatDate(item.Laptop_SignOut)}</Paragraph>
                    <Paragraph>{formatDate(item.Laptop_SignIn)}</Paragraph>
                  </View>
                )}
              />
            </TouchableRipple>
          ))}
        </List.Section>
      </ScrollView>

      <Modal visible={modalVisible} onRequestClose={closeModal}>
        <ScrollView>
          <View style={styles.modalContent}>
            <Title>{selectedItem?.Laptop_Name}</Title>

            {/* Placeholder for Image Frame */}
            <View style={styles.imageFrame} />
            <InfoRow
              label='Laptop ID'
              value={selectedItem?.Laptop_ID}
              icon='barcode'
            />

            <InfoRow
              label='User'
              value={selectedItem?.Laptop_User}
              icon='account'
            />

            <InfoRow
              label='Borrowed'
              value={formatDate(selectedItem?.Laptop_SignOut)}
              icon='calendar'
            />
            <InfoRow
              label='Returned'
              value={formatDate(selectedItem?.Laptop_SignIn)}
              icon='calendar-check'
            />

            {/* Add more fields as needed */}
            <Button onPress={closeModal} style={styles.closeButton}>
              Close
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Paragraph style={styles.infoLabel}>{label}</Paragraph>
    <Paragraph style={styles.infoValue}>{value}</Paragraph>
  </View>
);

const styles = StyleSheet.create({
  rightContent: {
    alignItems: 'flex-end',
  },
  modalContent: {
    padding: 16,
  },
  imageFrame: {
    aspectRatio: 1, // Square ratio
    backgroundColor: '#ddd', // Placeholder color
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  infoValue: {},
  closeButton: {
    marginTop: 8,
  },
  exportButton: {
    marginRight: 16,
  },
  exportButtonLabel: {
    color: '#fff', // Customize the color of the export button text
  },
});

export default LaptopLogScreen;
