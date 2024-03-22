import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Modal,
  StyleSheet,
  RefreshControl,
  Alert,
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

const RequestScreen = ({ userData, updateApproveNumber }) => {
  const [requestData, setRequestData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const isAdmin = () => {
    return userData?.User_Level === 'ADMIN';
  };

  const isOJT = () => {
    return userData?.User_Level === 'OJT';
  };

  const updateApproveNumbers = (newNumber) => {
    updateApproveNumber(newNumber);
  };

  const refreshRequestData = async () => {
    try {
      if (userData?.User_Level === 'ADMIN') {
        setRefreshing(true);
        const { data, error } = await supabase
          .from('InventoryRequest')
          .select('*');
        if (error) {
          console.error('Error refreshing request data:', error);
          Alert.alert('Error', 'Failed to refresh request data');
        } else {
          setRequestData(data);
          console.log(data.length + ' Item(s) found');
          console.log('refresh');
          updateApproveNumbers(data.length);
        }
      } else {
        setRefreshing(true);
        const { data, error } = await supabase
          .from('InventoryRequest')
          .select('*')
          .eq('User_ID', userData?.User_ID);
        if (error) {
          console.error('Error refreshing request data:', error);
          Alert.alert('Error', 'Failed to refresh request data');
        } else {
          setRequestData(data);
        }
      }
    } catch (error) {
      console.error('Error refreshing request data:', error.message);
      Alert.alert('Error', 'Failed to refresh request data');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchRequestData = async () => {
    try {
      if (userData?.User_Level === 'ADMIN') {
        const { data, error } = await supabase
          .from('InventoryRequest')
          .select('*');
        if (error) {
          console.error('Error refreshing request data:', error);
          Alert.alert('Error', 'Failed to refresh request data');
        } else {
          setRequestData(data);
          console.log(data.length + ' RequestScreen.js');
          updateApproveNumbers(data.length);
        }
      } else {
        const { data, error } = await supabase
          .from('InventoryRequest')
          .select('*')
          .eq('User_ID', userData?.User_ID);
        if (error) {
          console.error('Error refreshing request data:', error);
          Alert.alert('Error', 'Failed to refresh request data');
        } else {
          setRequestData(data);
        }
      }
    } catch (error) {
      console.error('Error refreshing request data:', error.message);
      Alert.alert('Error', 'Failed to refresh request data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequestData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchRequestData();
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

  const denyHandler = async () => {
    console.log(selectedItem?.Request_ID);
    try {
      setLoading(true);
      const { data: denyData, error: denyError } = await supabase
        .from('InventoryLaptopList')
        .upsert(
          [
            {
              Laptop_ID: selectedItem?.Laptop_ID,
              Laptop_Name: selectedItem?.Laptop_Name,
              Laptop_Brand: selectedItem?.Laptop_Brand,
              Laptop_Model: selectedItem?.Laptop_Model,

              Laptop_Quantity: 1,
            },
          ],
          { onConflict: ['Laptop_ID'] }
        );

      if (denyError) {
        console.error('Error Dennying Request:', denyError.message);
        Alert.alert('Error', 'Failed to deny request');
      } else {
        console.log('Request Denied Successfully', denyData);
        await supabase
          .from('InventoryRequest')
          .delete()
          .eq('Request_ID', selectedItem.Request_ID);
        closeModal();
        setSuccessModalVisible(true);
        fetchRequestData(); // Refresh request data after approval
      }
    } catch (error) {
      console.error('Error Approving Request:', error.message);
      Alert.alert('Error', 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedItem) {
      Alert.alert('Error', 'No request selected');
      return;
    }

    const currentDate = new Date();
    const formattedDate = currentDate
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    try {
      setLoading(true);
      const { data: approveData, error: approveError } = await supabase
        .from('LaptopBorrowed')
        .upsert([
          {
            User_ID: selectedItem.User_ID,
            User_DisplayName: selectedItem.User_DisplayName,
            Laptop_ID: selectedItem.Laptop_ID,
            Laptop_Name: selectedItem.Laptop_Name,
            Laptop_Brand: selectedItem.Laptop_Brand,
            Laptop_Model: selectedItem.Laptop_Model,
            Category: selectedItem.Category,
            Laptop_BorrowDate: formattedDate,
          },
        ]);

      if (approveError) {
        console.error('Error Approving Request:', approveError.message);
        Alert.alert('Error', 'Failed to approve request');
      } else {
        console.log('Request Approved Successfully', approveData);
        await supabase
          .from('InventoryRequest')
          .delete()
          .eq('Request_ID', selectedItem.Request_ID);
        closeModal();
        setSuccessModalVisible(true);
        fetchRequestData(); // Refresh request data after approval
      }
    } catch (error) {
      console.error('Error Approving Request:', error.message);
      Alert.alert('Error', 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Laptop':
        return 'laptop';
      case 'Headphones':
        return 'headphones';
      // Add more cases for other categories and their corresponding icons
      default:
        return 'help'; // Default icon if category is not recognized
    }
  };
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshRequestData}
        />
      }
    >
      <List.Section>
        {requestData.length > 0 ? (
          requestData.map((item) => (
            <TouchableRipple
              key={item.Laptop_ID}
              onPress={() => handleItemPress(item)}
            >
              <List.Item
                title={item.Laptop_Name}
                description={`Requested by: ${item.User_DisplayName}`}
                left={(props) => (
                  <List.Icon {...props} icon={getCategoryIcon(item.Category)} />
                )}
                style={styles.listItem}
                descriptionStyle={styles.description}
              />
            </TouchableRipple>
          ))
        ) : (
          <List.Item
            title='No requests available'
            description='The request list/database is empty.'
            style={styles.emptyList}
            descriptionStyle={styles.emptyDescription}
          />
        )}
      </List.Section>

      <Modal visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalContent}>
          <Title>{selectedItem?.Laptop_Name}</Title>
          {isAdmin() && (
            <InfoRow
              label='Requested By:'
              value={selectedItem?.User_DisplayName}
            />
          )}
          <InfoRow label='Laptop ID' value={selectedItem?.Laptop_ID} />
          <InfoRow label='Request Date' value={selectedItem?.Request_Date} />
          {isOJT() && <InfoRow label='Status' value='Pending Aproval' />}
          {isAdmin() && (
            <Button
              mode='outlined'
              onPress={handleApprove}
              loading={loading}
              disabled={loading}
              style={styles.returnButton}
            >
              Approve
            </Button>
          )}
          {isAdmin() && (
            <Button
              loading={loading}
              disabled={loading}
              onPress={denyHandler}
              style={styles.closeButton}
            >
              Deny
            </Button>
          )}
          <Button onPress={closeModal} style={styles.closeButton}>
            Close
          </Button>
        </View>
      </Modal>

      <Modal visible={successModalVisible} onRequestClose={closeSuccessModal}>
        <View style={styles.successModalContent}>
          <List.Icon icon='check-circle' color='#4CAF50' size={48} />
          <Title>Success</Title>
          <Paragraph style={styles.infoValue}>
            Request approved successfully.
          </Paragraph>
          <Button onPress={closeSuccessModal} style={styles.closeButton}>
            Close
          </Button>
        </View>
      </Modal>
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
  listItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    margin: 1,

    backgroundColor: '#f5f5f5', // Adjust the background color here
    borderRadius: 10,
  },
  description: {
    color: '#888',
    marginTop: 5,
  },
  emptyList: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#f5f5f5', // Adjust the background color here
  },
  emptyDescription: {
    fontStyle: 'italic',
    color: '#888',
    marginTop: 5,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
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
  button: {
    marginTop: 16,
  },
  approveButton: {
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
});

export default RequestScreen;
