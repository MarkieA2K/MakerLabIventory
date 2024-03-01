// InventoryScreen.js
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

const InventoryScreen = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const { data, error } = await supabase
          .from('InventoryList')
          .select('*');

        if (error) {
          console.error('Error fetching inventory data:', error);
        } else {
          setInventoryData(data);
        }
      } catch (error) {
        console.error('Error fetching inventory data:', error.message);
      }
    };

    fetchInventoryData();
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
          {inventoryData.map((item) => (
            <TouchableRipple
              key={item.Item_Id}
              onPress={() => handleItemPress(item)}
            >
              <List.Item
                title={item.Item_Name}
                description={item.Item_Description}
                left={(props) => <List.Icon {...props} icon='toolbox' />}
              />
            </TouchableRipple>
          ))}
        </List.Section>

        <Modal visible={modalVisible} onRequestClose={closeModal}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Title>{selectedItem?.Item_Name}</Title>

              {/* Placeholder for Image Frame */}
              <View style={styles.imageFrame} />

              <InfoRow label='ID' value={selectedItem?.Item_Id} />
              <InfoRow label='Name' value={selectedItem?.Item_Name} />
              <InfoRow
                label='Description'
                value={selectedItem?.Item_Description}
              />
              <InfoRow label='Category' value={selectedItem?.Item_Category} />
              <InfoRow label='Quantity' value={selectedItem?.Item_Quantity} />
              <InfoRow label='Brand' value={selectedItem?.Item_Brand} />
              <InfoRow label='Model' value={selectedItem?.Item_Model} />

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

export default InventoryScreen;
