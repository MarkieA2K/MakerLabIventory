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
import { useFocusEffect } from '@react-navigation/native';
import supabase from './supabase';

const ReturnScreen = ({ userData }) => {
  const [returnData, setReturnData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [returnButtonDisabled, setReturnButtonDisabled] = useState(false);

  const fetchReturnData = async () => {
    try {
      const { data, error } = await supabase
        .from('LaptopBorrowed')
        .select('*')
        .eq('User_ID', userData?.User_ID);

      if (error) {
        console.error('Error fetching return data:', error);
      } else {
        setReturnData(data);
      }
    } catch (error) {
      console.error('Error fetching return data:', error.message);
    } finally {
      setRefreshing(false); // Stop refreshing
    }
  };

  useEffect(() => {
    fetchReturnData();
  }, []); // No need for refreshing in the dependency array

  useFocusEffect(
    React.useCallback(() => {
      fetchReturnData();
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

  const returnLaptopHandler = async () => {
    try {
      // Disable the Return button to prevent spamming
      setReturnButtonDisabled(true);
      setLoading(true);

      const { data: laptopData, error: laptopError } = await supabase
        .from('LaptopBorrowed')
        .select('*')
        .eq('Borrow_ID', selectedItem?.Borrow_ID);

      if (laptopError) {
        console.error('Error fetching laptop details:', laptopError.message);
        return;
      }

      const selectedLaptop = laptopData[0];

      // Fetch user data using User_ID
      const { data: userData, error: userError } = await supabase
        .from('InventoryUsers')
        .select('User_DisplayName')
        .eq('User_ID', selectedLaptop?.User_ID);

      if (userError) {
        console.error('Error fetching user data:', userError.message);
        return;
      }

      const currentDate = new Date();
      const currentMonthName = new Intl.DateTimeFormat('en-US', {
        month: 'long',
      }).format(currentDate);

      const { data: logData, error: logError } = await supabase
        .from('InventoryLaptopLog')
        .upsert([
          {
            Laptop_ID: selectedItem?.Laptop_ID,
            Laptop_Name: selectedLaptop?.Laptop_Name,
            Laptop_User: userData[0]?.User_DisplayName,
            Laptop_SignOut: selectedLaptop?.Laptop_BorrowDate,
            Laptop_SignIn: currentDate.toISOString(),
            LaptopLog_Month: currentMonthName, // Store the month name in LaptopLog_Month
          },
        ]);

      if (logError) {
        console.error('Error adding log entry:', logError.message);
      } else {
        console.log('Log entry added successfully:', logData);

        const { data: deleteData, error: deleteError } = await supabase
          .from('LaptopBorrowed')
          .delete()
          .eq('Borrow_ID', selectedItem?.Borrow_ID);

        if (deleteError) {
          console.error(
            'Error deleting laptop from LaptopBorrowed:',
            deleteError.message
          );
        } else {
          console.log('Laptop deleted from LaptopBorrowed:', deleteData);

          const { data: updateQuantityData, error: updateQuantityError } =
            await supabase.from('InventoryLaptopList').upsert(
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

          if (updateQuantityError) {
            console.error(
              'Error updating quantity:',
              updateQuantityError.message
            );
          } else {
            console.log('Quantity updated successfully:', updateQuantityData);
            closeModal();
            fetchReturnData();
            setSuccessModalVisible(true); // Show success modal after returning laptop
          }
        }
      }
    } catch (error) {
      console.error('Error returning laptop:', error.message);
    } finally {
      // Ensure the Return button is re-enabled even in case of an error
      setReturnButtonDisabled(false);
      setLoading(false);
    }
  };

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Paragraph style={styles.infoLabel}>{label}</Paragraph>
      <Paragraph style={styles.infoValue}>{value}</Paragraph>
    </View>
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

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchReturnData} />
      }
    >
      <View>
        <List.Section>
          {returnData.length > 0 ? (
            returnData.map((item) => (
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
              title='No laptops currently in your possession'
              description='The list/database is empty or try refreshing.'
            />
          )}
        </List.Section>

        <Modal visible={modalVisible} onRequestClose={closeModal}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Title>{selectedItem?.Laptop_Name}</Title>

              {/* Placeholder for Image Frame */}
              <View style={styles.imageFrame} />

              <InfoRow label='ID' value={selectedItem?.Laptop_ID} />
              <InfoRow label='Name' value={selectedItem?.Laptop_Name} />

              <InfoRow label='Brand' value={selectedItem?.Laptop_Brand} />
              <InfoRow label='Model' value={selectedItem?.Laptop_Model} />
              <InfoRow
                label='Borrow Date'
                value={formatDate(selectedItem?.Laptop_BorrowDate)}
              />

              {/* Return Button with loading and disabled props */}
              <Button
                mode='outlined'
                onPress={returnLaptopHandler}
                style={styles.returnButton}
                disabled={returnButtonDisabled}
                loading={loading}
              >
                Return
              </Button>

              {/* Add more fields as needed */}
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
              Laptop returned successfully!
            </Paragraph>

            <View style={styles.returnDateTime}>
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
  returnButton: {
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
  returnDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
});

export default ReturnScreen;
