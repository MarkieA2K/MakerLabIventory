import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Modal,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  List,
  Title,
  Paragraph,
  TouchableRipple,
  Button,
} from 'react-native-paper';
import supabase from './supabase';
import { useFocusEffect } from '@react-navigation/native';

const LaptopScreen = ({ userData }) => {
  const [laptopData, setLaptopData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [borrowButtonDisabled, setBorrowButtonDisabled] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);

  const refreshLaptopData = async () => {
    try {
      setRefreshing(true);
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
    } finally {
      setRefreshing(false);
    }
  };

  const borrowLaptopHandler = async () => {
    try {
      // Disable the Borrow button to prevent spamming
      setBorrowButtonDisabled(true);
      setBorrowLoading(true); // Set loading to true when the operation starts

      const currentDate = new Date();
      const formattedDate = currentDate
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      const { data: borrowData, error: borrowError } = await supabase
        .from('LaptopBorrowed')
        .upsert([
          {
            User_ID: userData?.User_ID,
            Laptop_ID: selectedItem?.Laptop_ID,
            Laptop_Name: selectedItem?.Laptop_Name,
            Laptop_Brand: selectedItem?.Laptop_Brand,
            Laptop_Model: selectedItem?.Laptop_Model,
            Laptop_BorrowDate: formattedDate,
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
          refreshLaptopData();
        }
      }
    } catch (error) {
      console.error('Error borrowing data:', error.message);
    } finally {
      // Ensure the Borrow button is re-enabled even in case of an error
      setBorrowButtonDisabled(false);
      setBorrowLoading(false); // Set loading back to false after the operation
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

  useFocusEffect(
    React.useCallback(() => {
      fetchLaptopData();
    }, [])
  );

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
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshLaptopData} />
      }
    >
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

              <View style={styles.imageFrame} />

              <InfoRow label='ID' value={selectedItem?.Laptop_ID} />
              <InfoRow label='Name' value={selectedItem?.Laptop_Name} />
              <InfoRow
                label='Description'
                value={selectedItem?.Laptop_Description}
              />
              <InfoRow label='Brand' value={selectedItem?.Laptop_Brand} />
              <InfoRow label='Model' value={selectedItem?.Laptop_Model} />

              {/* Borrow Button with loading and disabled props */}
              <Button
                mode='outlined'
                onPress={borrowLaptopHandler}
                style={styles.borrowButton}
                disabled={borrowButtonDisabled}
                loading={borrowLoading}
              >
                {borrowLoading ? 'Borrowing...' : 'Borrow'}
              </Button>

              <Button onPress={closeModal} style={styles.closeButton}>
                Close
              </Button>
            </View>
          </ScrollView>
        </Modal>

        <Modal visible={successModalVisible} onRequestClose={closeSuccessModal}>
          <View style={styles.successModalContent}>
            <Title>Success</Title>
            <Paragraph style={styles.successModalText}>
              Laptop borrowed successfully!
            </Paragraph>
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
    aspectRatio: 1,
    backgroundColor: '#ddd',
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
  successModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  successModalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default LaptopScreen;
