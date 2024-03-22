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
  FAB,
} from 'react-native-paper';
import supabase from './supabase';
import { useFocusEffect } from '@react-navigation/native';

const LaptopScreen = ({ navigation, userData }) => {
  const [laptopData, setLaptopData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [borrowButtonDisabled, setBorrowButtonDisabled] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const isAdmin = () => {
    return userData?.User_Level === 'ADMIN';
  };

  const isOJT = () => {
    return userData?.User_Level === 'OJT';
  };

  const fetchLaptopData = async () => {
    try {
      let query = supabase
        .from('InventoryLaptopList')
        .select('*')
        .not('Laptop_Quantity', 'eq', 0);
      if (selectedCategory) {
        query = query.eq('Category', selectedCategory);
      }
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching laptop data:', error);
      } else {
        setLaptopData(data);
      }
    } catch (error) {
      console.error('Error fetching laptop data:', error.message);
    }
  };

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

      // Fetch User_DisplayName based on User_ID from InventoryUsers
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

      const { data: borrowData, error: borrowError } = await supabase
        .from('LaptopBorrowed')
        .upsert([
          {
            User_ID: userData?.User_ID,
            User_DisplayName: userDisplayName,
            Laptop_ID: selectedItem?.Laptop_ID,
            Laptop_Name: selectedItem?.Laptop_Name,
            Laptop_Brand: selectedItem?.Laptop_Brand,
            Laptop_Model: selectedItem?.Laptop_Model,
            Category: selectedItem?.Category,
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
                Category: selectedItem?.Category,
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

  const requestLaptopHandler = async () => {
    try {
      setBorrowButtonDisabled(true);
      setBorrowLoading(true);
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
            Category: selectedItem?.Category,

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
                Category: selectedItem?.Category,
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
          setBorrowButtonDisabled(false);
          setBorrowLoading(false);
        }
      }
    } catch (error) {
      console.error('Error requesting data:', error.message);
    } finally {
      setBorrowButtonDisabled(false);
      setBorrowLoading(false);
    }
  };

  useEffect(() => {
    fetchLaptopData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchLaptopData();
    }, [selectedCategory])
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
  // React.useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <View>
  //         <RNPickerSelect
  //           onValueChange={(value) => setSelectedCategory(value)}
  //           items={[
  //             { label: 'All Categories', value: null },
  //             { label: 'Laptop', value: 'Laptop' },
  //             { label: 'Headphones', value: 'Headphones' },
  //             // Add more categories as neededYYY
  //           ]}
  //           placeholder={{ label: 'Select a category', value: null }}
  //           style={pickerSelectStyles}
  //           useNativeAndroidPickerStyle={false}
  //         />
  //       </View>
  //     ),
  //   });
  // }, [navigation, selectedCategory]);

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
    <View style={styles.flexview}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshLaptopData}
          />
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
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={getCategoryIcon(item.Category)}
                      />
                    )}
                    style={styles.listItem}
                    descriptionStyle={styles.description}
                  />
                </TouchableRipple>
              ))
            ) : (
              <List.Item
                title='No equipment available for use'
                description='The list/database is empty.'
                style={styles.emptyList}
                descriptionStyle={styles.emptyDescription}
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

                {/* Borrow Button with loading and disabled props */}
                {isAdmin() && (
                  <Button
                    mode='outlined'
                    onPress={borrowLaptopHandler}
                    style={styles.borrowButton}
                    disabled={borrowButtonDisabled}
                    loading={borrowLoading}
                  >
                    Borrow
                  </Button>
                )}
                {isOJT() && (
                  <Button
                    mode='outlined'
                    onPress={requestLaptopHandler}
                    style={styles.borrowButton}
                    disabled={borrowButtonDisabled}
                    loading={borrowLoading}
                  >
                    Request
                  </Button>
                )}

                <Button
                  mode='outlined'
                  onPress={closeModal}
                  style={styles.closeButton}
                >
                  Close
                </Button>
              </View>
            </ScrollView>
          </Modal>
          <Modal
            visible={successModalVisible}
            onRequestClose={closeSuccessModal}
          >
            <View style={styles.successModalContent}>
              <List.Icon icon='check-circle' color='#4CAF50' size={48} />
              <Title>Success</Title>
              {isAdmin() && (
                <Paragraph style={styles.successModalText}>
                  Equipment borrowed successfully!
                </Paragraph>
              )}
              {isOJT() && (
                <Paragraph style={styles.successModalText}>
                  Equipment Requested successfully!
                </Paragraph>
              )}

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
      <FAB style={styles.fab} icon='plus' />
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
  flexview: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
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

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default LaptopScreen;
