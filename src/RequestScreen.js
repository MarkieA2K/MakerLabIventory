import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Modal,
  StyleSheet,
  RefreshControl,
  Alert,
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
import supabase from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderNav from './component/HeaderNav';
import styles from './styles';

const RequestScreen = ({ userData, updateApproveNumber, setLoggedIn }) => {
  const [requestData, setRequestData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [denyLoading, setDenyLoading] = useState(false);

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
      setDenyLoading(true);
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
      setDenyLoading(false);
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
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
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
      <HeaderNav userData={userData} setLoggedIn={setLoggedIn} />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
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
                  titleStyle={styles.title}
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
              titleStyle={styles.emptyTitle}
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
                  Requested by: {selectedItem?.User_DisplayName}
                </Text>

                <Divider />

                <Text style={styles.whiteText}>Description:</Text>
                <Paragraph style={styles.whiteText}>
                  {selectedItem?.Laptop_Description}
                </Paragraph>
                {isOJT() && (
                  <Paragraph style={styles.whiteText}>
                    Status: Pending
                  </Paragraph>
                )}

                {/* Borrow Button with loading and disabled props */}
                {isAdmin() && (
                  <Button
                    mode='contained'
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
                    mode='contained'
                    loading={loading}
                    disabled={loading}
                    onPress={denyHandler}
                    style={styles.returnButton}
                  >
                    Deny
                  </Button>
                )}

                <Button
                  mode='contained'
                  onPress={closeModal}
                  style={styles.closeButton}
                >
                  Close
                </Button>
              </View>
            </ScrollView>
          </LinearGradient>
        </Modal>

        {/* <Modal visible={modalVisible} onRequestClose={closeModal}>
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
        </Modal> */}

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
    </LinearGradient>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Paragraph style={styles.infoLabel}>{label}</Paragraph>
    <Paragraph style={styles.infoValue}>{value}</Paragraph>
  </View>
);

export default RequestScreen;
