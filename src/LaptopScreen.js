import React, { useEffect, useState } from 'react';
import { View, ScrollView, Modal, StyleSheet } from 'react-native';
import {
  List,
  Title,
  Paragraph,
  TouchableRipple,
  Button,
} from 'react-native-paper';
import supabase from './supabase';

const LaptopScreen = ({ userData }) => {
  const [laptopData, setLaptopData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const refreshLaptopData = async () => {
    try {
      const { data, error } = await supabase
        .from('InventoryLaptopList')
        .select('*')
        .not('Laptop_Quantity', 'eq', 0);

      if (error) {
        console.error('Error refreshing laptop data:', error);
      } else {
        setLaptopData(data);
      }
    } catch (error) {
      console.error('Error refreshing laptop data:', error.message);
    }
  };

  const borrowLaptopHandler = async () => {
    try {
      const { data: borrowData, error: borrowError } = await supabase
        .from('LaptopBorrowed')
        .upsert([
          {
            User_ID: userData?.User_ID,
            Laptop_ID: selectedItem?.Laptop_ID,
            Laptop_Name: selectedItem?.Laptop_Name,
            Laptop_Brand: selectedItem?.Laptop_Brand,
            Laptop_Model: selectedItem?.Laptop_Model,
          },
        ]);

      if (borrowError) {
        console.error('Error borrowing data:', borrowError.message);
      } else {
        console.log('Data borrowed successfully:', borrowData);

        const { data: updateData, error: updateError } = await supabase
          .from('InventoryLaptopList')
          .upsert(
            [
              {
                Laptop_ID: selectedItem?.Laptop_ID,
                Laptop_Name: selectedItem?.Laptop_Name,
                Laptop_Brand: selectedItem?.Laptop_Brand,
                Laptop_Model: selectedItem?.Laptop_Model,
                Laptop_Quantity: 0,
              },
            ],
            { onConflict: ['Laptop_ID'] }
          );

        if (updateError) {
          console.error('Error updating quantity:', updateError.message);
        } else {
          console.log('Quantity updated successfully:', updateData);
          setModalVisible(false);
          setSuccessModalVisible(true);
          refreshLaptopData(); // Call the refresh function after successful borrow
        }
      }
    } catch (error) {
      console.error('Error borrowing data:', error.message);
    }
  };

  const fetchLaptopData = async () => {
    try {
      const { data, error } = await supabase
        .from('InventoryLaptopList')
        .select('*')
        .not('Laptop_Quantity', 'eq', 0);

      if (error) {
        console.error('Error fetching laptop data:', error);
      } else {
        setLaptopData(data);
      }
    } catch (error) {
      console.error('Error fetching laptop data:', error.message);
    }
  };

  useEffect(() => {
    fetchLaptopData();
  }, []);

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const closeSuccessModal = () => {
    setSuccessModalVisible(false);
  };

  return (
    <ScrollView>
      <View>
        <List.Section>
          {laptopData.map((item) => (
            <TouchableRipple
              key={item.Laptop_ID}
              onPress={() => handleItemPress(item)}
            >
              <List.Item
                title={item.Laptop_Name}
                description={item.Laptop_Description}
                left={(props) => <List.Icon {...props} icon='laptop' />}
              />
            </TouchableRipple>
          ))}
        </List.Section>

        <Modal visible={modalVisible} onRequestClose={closeModal}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Title>{selectedItem?.Laptop_Name}</Title>

              {/* Placeholder for Image Frame */}
              <View style={styles.imageFrame} />

              <InfoRow label='ID' value={selectedItem?.Laptop_ID} />
              <InfoRow label='Name' value={selectedItem?.Laptop_Name} />
              <InfoRow
                label='Description'
                value={selectedItem?.Laptop_Description}
              />
              <InfoRow label='Brand' value={selectedItem?.Laptop_Brand} />
              <InfoRow label='Model' value={selectedItem?.Laptop_Model} />

              {/* Placeholder for Borrow Button */}
              <Button
                mode='outlined'
                onPress={borrowLaptopHandler}
                style={styles.borrowButton}
              >
                Borrow
              </Button>

              {/* Add more fields as needed */}
              <Button onPress={closeModal} style={styles.closeButton}>
                Close
              </Button>
            </View>
          </ScrollView>
        </Modal>

        <Modal visible={successModalVisible} onRequestClose={closeSuccessModal}>
          <View style={styles.modalContent}>
            <Title>Success</Title>
            <Paragraph>Laptop borrowed successfully!</Paragraph>
            <Button onPress={closeSuccessModal} style={styles.closeButton}>
              Close
            </Button>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Paragraph style={styles.infoLabel}>{label}</Paragraph>
    <Paragraph style={styles.infoValue}>{value}</Paragraph>
  </View>
);

const styles = StyleSheet.create({
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
  borrowButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 8,
  },
});

export default LaptopScreen;
