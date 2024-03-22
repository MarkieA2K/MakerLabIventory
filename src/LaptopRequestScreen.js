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

const LaptopRequestScreen = ({ userData }) => {
  const [laptopData, setLaptopData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requestButtonDisabled, setRequestButtonDisabled] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

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

  const requestLaptopHandler = async () => {
    try {
      const currentDate = new Date();
      const formattedDate = currentDate
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      const { data: userDisplayData, error: userDisplayError } = await supabase
        .from('InventoryUsers')
        .select('User_DisplayName')
        .eq('User_ID', userData?.User_ID)
        .single();

      if (userDisplayError) {
        console.error(
          'Error fetching user display name:',
          userDisplayError.message
        );
        return;
      }

      const userDisplayName = userDisplayData?.User_DisplayName;

      const { data: requestData, error: requestError } = await supabase
        .from('InventoryRequest')
        .upsert([
          {
            User_ID: userData?.User_ID,
            User_DisplayName: userDisplayName,
            Laptop_ID: selectedItem?.Laptop_ID,
            Laptop_Name: selectedItem?.Laptop_Name,
            Laptop_Model: selectedItem?.Laptop_Model,
            Laptop_Brand: selectedItem?.Laptop_Brand,

            Request_Date: formattedDate,
          },
        ]);

      if (requestError) {
        console.error('Error requesting data:', requestError.message);
      } else {
        console.log('Data requested successfully:', requestData);

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

          setSuccessModalVisible(true);
          refreshLaptopData();
        }
      }
    } catch (error) {
      console.error('Error requesting data:', error.message);
    } finally {
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
          {laptopData.length > 0 ? (
            laptopData.map((item) => (
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
            ))
          ) : (
            <List.Item
              title='No equipment available for use'
              description='The list/database is empty.'
            />
          )}
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
              <Button
                mode='outlined'
                onPress={requestLaptopHandler}
                style={styles.borrowButton}
                disabled={requestButtonDisabled}
                loading={requestLoading}
              >
                {requestLoading ? 'Requesting...' : 'Request Borrow'}
              </Button>
              <Button onPress={closeModal} style={styles.closeButton}>
                Close
              </Button>
            </View>
          </ScrollView>
        </Modal>

        <Modal visible={successModalVisible} onRequestClose={closeSuccessModal}>
          <View style={styles.successModalContent}>
            <List.Icon icon='check-circle' color='#4CAF50' size={48} />
            <Title>Success</Title>
            <Paragraph style={styles.successModalText}>
              Equipment requested successfully!
            </Paragraph>
            <View style={styles.borrowDateTime}>
              <List.Icon icon='calendar' color='#2196F3' size={24} />
              <Paragraph style={styles.infoValue}>
                {new Date().toLocaleString()}
              </Paragraph>
            </View>
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
  borrowDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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

export default LaptopRequestScreen;
