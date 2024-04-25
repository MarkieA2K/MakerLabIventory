import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Modal,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import {
  List,
  Title,
  Paragraph,
  TouchableRipple,
  Button,
  Text,
  Divider,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import supabase from './supabase';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderNav from './component/HeaderNav';
import styles from './styles';

const ReturnScreen = ({ userData, setLoggedIn, changeMode }) => {
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
      const currentYear = currentDate.getFullYear(); // Get the current year as a number
      const currentYearString = currentYear.toString(); // Convert the year to a string

      const { data: logData, error: logError } = await supabase
        .from('InventoryLaptopLog')
        .upsert([
          {
            Laptop_ID: selectedItem?.Laptop_ID,
            Laptop_Name: selectedLaptop?.Laptop_Name,
            Laptop_User: userData[0]?.User_DisplayName,
            Laptop_SignOut: selectedLaptop?.Laptop_BorrowDate,
            Laptop_SignIn: currentDate.toISOString(),
            Category: selectedLaptop?.Category,
            LaptopLog_Month: currentMonthName, // Store the month name in LaptopLog_Month
            LaptopLog_Year: currentYearString, // Store the year as a string in LaptopLog_Year
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
                  Category: selectedLaptop?.Category,
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

  const getItemImage = (category) => {
    switch (category) {
      case 'Laptop':
        return require('../assets/LaptopPic.png');
      case 'Headphones':
        return require('../assets/HeadphonesPic.png');
      // Add more cases for other categories and their corresponding images
      default:
        return require('../assets/A2K-LOGO.png'); // Default image if category is not recognized
    }
  };

  return (
    <LinearGradient
      colors={['#242A3E', '#191D2B', '#0F1016']}
      style={styles.flexview}
    >
      <HeaderNav
        userData={userData}
        setLoggedIn={setLoggedIn}
        changeMode={changeMode}
      />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
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
                    left={() => {
                      switch (item.Category) {
                        case 'Laptop':
                          return (
                            <Image
                              source={require('../assets/LaptopPic.png')}
                              style={styles.icon}
                            />
                          );
                        case 'Headphones':
                          return (
                            <Image
                              source={require('../assets/HeadphonesPic.png')}
                              style={styles.icon}
                            />
                          );
                        // Add more cases for other categories and their corresponding images
                        default:
                          return (
                            <Image
                              source={require('../assets/A2K-LOGO.png')}
                              style={styles.icon}
                            />
                          ); // Default image if category is not recognized
                      }
                    }}
                    style={styles.listItem}
                    titleStyle={styles.title}
                    descriptionStyle={styles.description}
                  />
                </TouchableRipple>
              ))
            ) : (
              <List.Item
                title='No laptops currently in your possession'
                description='The list/database is empty or try refreshing.'
                style={styles.emptyList}
                titleStyle={styles.title}
                descriptionStyle={styles.emptyDescription}
              />
            )}
          </List.Section>
          <Modal
            visible={modalVisible}
            animationType='fade'
            onRequestClose={closeModal}
          >
            <LinearGradient
              colors={['#242A3E', '#191D2B', '#0F1016']}
              style={styles.flexview}
            >
              <ScrollView style={styles.modalContent}>
                <View style={styles.imageView}>
                  <Image
                    source={getItemImage(selectedItem?.Category)}
                    style={styles.imageFrame}
                  />
                </View>

                <View style={styles.modalBox}>
                  <Text
                    variant='headlineMedium'
                    style={[
                      styles.modalHeaderText,
                      { textAlign: 'center', color: '#FFFFFF' },
                    ]}
                  >
                    {selectedItem?.Laptop_Name}
                  </Text>
                  <Divider />

                  <Text style={styles.whiteText}>
                    ID: {selectedItem?.Laptop_ID}
                  </Text>
                  <Text style={styles.whiteText}>
                    Brand: {selectedItem?.Laptop_Brand}
                  </Text>
                  <Text style={styles.whiteText}>
                    Model: {selectedItem?.Laptop_Model}
                  </Text>
                  <Text style={styles.whiteText}>
                    Date Borrowed: {formatDate(selectedItem?.Laptop_BorrowDate)}
                  </Text>

                  {/* <InfoRow label='ID' value={selectedItem?.Laptop_ID} />
                  <InfoRow label='Brand' value={selectedItem?.Laptop_Brand} />
                  <InfoRow label='Model' value={selectedItem?.Laptop_Model} /> */}

                  <Divider />
                  {/* <InfoRow
                    label='Description'
                    value={selectedItem?.Laptop_Description}
                  /> */}

                  {/* Borrow Button with loading and disabled props */}

                  <Button
                    mode='contained'
                    onPress={returnLaptopHandler}
                    style={styles.returnButton}
                    disabled={returnButtonDisabled}
                    loading={loading}
                  >
                    Return
                  </Button>

                  {/* Add more fields as needed */}
                  <Button
                    onPress={closeModal}
                    style={styles.closeButton}
                    mode='contained'
                  >
                    Close
                  </Button>
                </View>
              </ScrollView>
            </LinearGradient>
          </Modal>

          <Modal
            visible={successModalVisible}
            onRequestClose={closeSuccessModal}
          >
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
    </LinearGradient>
  );
};

export default ReturnScreen;
