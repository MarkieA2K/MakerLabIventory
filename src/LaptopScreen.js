// LaptopScreen.js
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

const LaptopScreen = () => {
  const [laptopData, setLaptopData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchLaptopData = async () => {
      try {
        const { data, error } = await supabase
          .from('InventoryLaptopList')
          .select('*');

        if (error) {
          console.error('Error fetching laptop data:', error);
        } else {
          setLaptopData(data);
        }
      } catch (error) {
        console.error('Error fetching laptop data:', error.message);
      }
    };

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
                onPress={() => console.log('Borrow button pressed')}
                style={styles.borrowButton}
              >
                Log use
              </Button>

              {/* Add more fields as needed */}
              <Button onPress={closeModal} style={styles.closeButton}>
                Close
              </Button>
            </View>
          </ScrollView>
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
