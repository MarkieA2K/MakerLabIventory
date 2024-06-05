import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Modal,
  StyleSheet,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import {
  List,
  Title,
  Paragraph,
  TouchableRipple,
  Button,
  FAB,
  Divider,
  Provider,
  Text,
  TextInput,
  Modal as PaperModal,
  SegmentedButtons,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import supabase from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderNav from './component/HeaderNav';
import styles from './styles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SelectList } from 'react-native-dropdown-select-list';
import DropDown from 'react-native-paper-dropdown';

const LaptopScreen = ({ navigation, userData, setLoggedIn, changeMode }) => {
  const [laptopData, setLaptopData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [borrowButtonDisabled, setBorrowButtonDisabled] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addVisible, setAddVisible] = useState(false);
  const [inputID, setInputID] = useState(null);
  const [inputName, setInputName] = useState(null);
  const [inputBrand, setInputBrand] = useState(null);
  const [inputModel, setInputModel] = useState(null);
  const [inputDesc, setInputDesc] = useState(null);
  const [showError, setShowError] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [inputCategory, setInputCategory] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [delDisable, setDelDisable] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);
  const [image, setImage] = useState();

  const dropItems = [
    { label: 'Laptop', value: 'Laptop' },
    { label: 'Headphones', value: 'Headphones' },
    { label: 'Tools', value: 'Tools' },
  ];

  const isAdd = () => {
    return modalMode === 'Add';
  };
  const isDelete = () => {
    return modalMode === 'Delete';
  };

  const isEdit = () => {
    return modalMode === 'Edit';
  };

  const isAdmin = () => {
    return userData?.User_Level === 'ADMIN';
  };

  const isOJT = () => {
    return userData?.User_Level === 'OJT';
  };

  const isBorrow = () => {
    return modalMode === 'Borrow';
  };

  const isRequest = () => {
    return modalMode === 'Request';
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
  const checkLaptopQuantity = async (laptopID) => {
    try {
      const { data, error } = await supabase
        .from('InventoryLaptopList')
        .select('Laptop_Quantity')
        .eq('Laptop_ID', laptopID)
        .single();

      if (error) {
        console.error('Error checking laptop quantity:', error.message);
        return null; // Return null or handle the error accordingly
      }

      return data.Laptop_Quantity; // Return the laptop quantity
    } catch (error) {
      console.error('Error checking laptop quantity:', error.message);
      return null; // Return null or handle the error accordingly
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

  const pickImage = async () => {
    setBorrowButtonDisabled(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
      base64: true,
    });

    if (!result.cancelled) {
      const imageBase64 = 'data:image/jpeg;base64,' + result.assets[0].base64;
      console.log(imageBase64);
      setImage(imageBase64);
      setBorrowButtonDisabled(false);
    }
  };
  const takePhoto = async () => {
    setBorrowButtonDisabled(true);
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
      base64: true,
    });

    if (!result.cancelled) {
      const imageBase64 = 'data:image/jpeg;base64,' + result.assets[0].base64;
      console.log(imageBase64);
      setImage(imageBase64);
      setBorrowButtonDisabled(false);
    }
  };
  const addLaptopItem = async () => {
    if (!image) {
      alert('Please choose an image first');
      return;
    }
    setBorrowButtonDisabled(true);
    setBorrowLoading(true);

    const apiUrl = `https://api.cloudinary.com/v1_1/dljhqktls/image/upload`;
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'Inventory upload'); // Replace with your upload preset

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        config,
      });

      const data = await response.json();
      const imageUrl = data.secure_url;
      const imageId = data.public_id;

      try {
        // Proceed with inserting the laptop item into the database
        const { data: laptopData, error: laptopError } = await supabase
          .from('InventoryLaptopList')
          .insert([
            {
              Laptop_ID: inputID,
              Laptop_Name: inputName,
              Laptop_Brand: inputBrand,
              Laptop_Model: inputModel,
              Laptop_Description: inputDesc,
              Category: inputCategory,
              Laptop_Quantity: 1, // Assuming the default quantity is 1 for a new item
              Image_URL: imageUrl,
              Image_ID: imageId,
            },
          ]);

        if (laptopError) {
          if (
            laptopError.code === '23505' &&
            laptopError.constraint === 'InventoryLaptopList_Laptop_ID_key'
          ) {
            console.log('Duplicate key violation');
          } else {
            console.error('Error adding laptop item:', laptopError.message);
            setShowError(true);
            setBorrowButtonDisabled(false);
            setBorrowLoading(false);
            // Handle other types of errors here
          }
        } else {
          console.log('item added successfully:', laptopData);
          // Optionally, you can update the local state to reflect the newly added item
          // For example, you can call fetchLaptopData() to refresh the laptop data
          setBorrowButtonDisabled(false);
          setBorrowLoading(false);
          setSuccessModalVisible(true);

          // Clear the input fields after successful addition
          setInputID(null);
          setInputName(null);
          setInputBrand(null);
          setInputModel(null);
          setInputDesc(null);
          setInputCategory(null);
          setImage(null); // Clear the image state
          // Close the modal after adding the item
          setAddVisible(false);
          setModalVisible(false);
        }
      } catch (error) {
        console.error('Error adding laptop item:', error.message);
        // Handle other types of errors here
      }
    } catch (error) {
      console.error(error);
      alert('Error uploading image');
    }
  };
  const editHandler = async () => {
    setBorrowButtonDisabled(true);
    setBorrowLoading(true);
    try {
      // Check if any form field is empty
      if (
        !inputID ||
        !inputName ||
        !inputBrand ||
        !inputModel ||
        !inputDesc ||
        !inputCategory
      ) {
        setErrorMsg('All fields are required');
        return; // Exit the function early if any field is empty
      }

      // Proceed with updating the laptop item in the database
      const { data, error } = await supabase
        .from('InventoryLaptopList')
        .update({
          Laptop_Name: inputName,
          Laptop_Brand: inputBrand,
          Laptop_Model: inputModel,
          Laptop_Description: inputDesc,
          Category: inputCategory,
        })
        .eq('Laptop_ID', inputID);

      if (error) {
        setErrorMsg('Error editing laptop item: ' + error.message);
        // Handle error here
      } else {
        console.log('Laptop item edited successfully:', data);
        setBorrowButtonDisabled(false);
        setBorrowLoading(false);
        setDisabled(false);
        setErrorMsg(null);
        // Optionally, you can update the local state to reflect the changes
        // For example, you can call fetchLaptopData() to refresh the laptop data
        setSuccessModalVisible(true);

        // Clear the input fields after successful edition
        setInputID(null);
        setInputName(null);
        setInputBrand(null);
        setInputModel(null);
        setInputDesc(null);
        setInputCategory(null);
        // Close the modal after editing the item
        setAddVisible(false);
        setModalVisible(false);
      }
    } catch (error) {
      setErrorMsg('Error editing laptop item: ' + error.message);
      setBorrowButtonDisabled(false);
      setBorrowLoading(false);
      // Handle other types of errors here
    }
  };
  const deleteHandler = async () => {
    try {
      setBorrowButtonDisabled(true);
      setBorrowLoading(true);

      // Proceed with deleting the laptop item from the database
      const { data, error } = await supabase
        .from('InventoryLaptopList')
        .delete()
        .eq('Laptop_ID', selectedItem?.Laptop_ID);

      if (error) {
        console.error('Error deleting laptop item:', error.message);
      } else {
        console.log('Laptop item deleted successfully:', data);
        setBorrowButtonDisabled(false);
        setBorrowLoading(false);
        // Update the local state to reflect the changes

        // Close the modal after deleting the item
        setModalVisible(false);

        setSuccessModalVisible(true);
      }
    } catch (error) {
      console.error('Error deleting laptop item:', error.message);
    }
  };

  const addVerifyHandler = () => {
    try {
      // Check if any form field is empty
      if (
        !inputID ||
        !inputName ||
        !inputBrand ||
        !inputModel ||
        !inputDesc ||
        !image ||
        !inputCategory
      ) {
        setErrorMsg('All fields are required');
        return; // Exit the function early if any field is empty
      }

      // Call the function to add the laptop item
      addLaptopItem();
    } catch (error) {
      console.error('Error verifying form data:', error.message);
      // Handle other types of errors here
    }
  };
  const openEdit = () => {
    console.log('EDIT NA');
    setModalMode('Edit');
    setAddVisible(true);
    setDisabled(true);
    setInputID(selectedItem ? selectedItem.Laptop_ID : null); ///error here chatgpt
    setInputName(selectedItem ? selectedItem.Laptop_Name : null);
    setInputBrand(selectedItem ? selectedItem.Laptop_Brand : null);
    setInputModel(selectedItem ? selectedItem.Laptop_Model : null);
    setInputDesc(selectedItem ? selectedItem.Laptop_Description : null);
    setInputCategory(selectedItem ? selectedItem.Category : null);
  };
  const openDelete = () => {
    console.log('DELETE MO');
    setDelDisable(true);
    setModalMode('Delete');
    setAddVisible(true);
    setDisabled(true);
    setInputID(selectedItem ? selectedItem.Laptop_ID : null); ///error here chatgpt
    setInputName(selectedItem ? selectedItem.Laptop_Name : null);
    setInputBrand(selectedItem ? selectedItem.Laptop_Brand : null);
    setInputModel(selectedItem ? selectedItem.Laptop_Model : null);
    setInputDesc(selectedItem ? selectedItem.Laptop_Description : null);
    setInputCategory(selectedItem ? selectedItem.Category : null);
  };

  const borrowLaptopHandler = async () => {
    try {
      // Disable the Borrow button to prevent spamming
      setBorrowButtonDisabled(true);
      setBorrowLoading(true); // Set loading to true when the operation starts

      // Check if the selected laptop has quantity available
      if (selectedItem.Laptop_Quantity === 0) {
        console.log('O siya');
        console.error('Error borrowing data: No quantity available');
        return;
      }

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
            Image_URL: selectedItem?.Image_URL,
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
          setModalMode('Borrow');
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
            Image_URL: selectedItem?.Image_URL,

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
          setModalMode('Request');
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

  const handleItemPress = async (item) => {
    try {
      const laptopID = item.Laptop_ID;
      const laptopQuantity = await checkLaptopQuantity(laptopID);

      if (laptopQuantity === null) {
        console.error('Error retrieving laptop quantity');
        return;
      }

      if (laptopQuantity === 0) {
        Alert.alert(
          'Item Unavailable',
          'This item is currently unavailable for borrowing.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('OK Pressed');
                fetchLaptopData(); // Fetch data again after pressing OK
              },
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      } else {
        console.log('Laptop quantity is greater than zero');
        // Handle the case when laptop quantity is greater than zero, such as displaying detailed information about the laptop item
        setSelectedItem(item);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error handling item press:', error.message);
    }
  };
  const closeModal = () => {
    setBorrowButtonDisabled(false);
    setBorrowLoading(false);
    setModalVisible(false);
    setSelectedItem(null);
  };

  const closeSuccessModal = () => {
    setDisabled(false);
    setDelDisable(false);
    fetchLaptopData();
    setModalMode(null);
    setSuccessModalVisible(false);
    setAddVisible(false);

    setInputID(null);
    setInputName(null);
    setInputBrand(null);
    setInputModel(null);
    setInputDesc(null);
    setInputCategory(null);
    setShowError(false);
  };

  const addModalshow = () => {
    setModalMode('Add');
    setAddVisible(true);
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
  const handleCategoryChange = (value) => {
    setSelectedCategory(selectedCategory === value ? null : value);
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshLaptopData}
          />
        }
      >
        <SegmentedButtons
          style={{ paddingHorizontal: 20, marginVertical: 10 }}
          value={selectedCategory}
          onValueChange={handleCategoryChange}
          buttons={[
            {
              value: 'Laptop',
              label: 'Laptop',
              style: {
                backgroundColor:
                  selectedCategory === 'Laptop' ? '#fff' : '#333', // Light background for selected, dark for others
                borderColor: '#fff', // White border
                borderWidth: 1,
              },
              labelStyle: {
                color: selectedCategory === 'Laptop' ? '#000' : '#fff', // Black text for selected, white for others
                fontWeight: 'bold', // Bold text
              },
            },
            {
              value: 'Headphones',
              label: 'Headphones',
              style: {
                backgroundColor:
                  selectedCategory === 'Headphones' ? '#fff' : '#333',
                borderColor: '#fff',
                borderWidth: 1,
              },
              labelStyle: {
                color: selectedCategory === 'Headphones' ? '#000' : '#fff',
                fontWeight: 'bold',
              },
            },
            {
              value: 'Tools',
              label: 'Tools',
              style: {
                backgroundColor: selectedCategory === 'Tools' ? '#fff' : '#333',
                borderColor: '#fff',
                borderWidth: 1,
              },
              labelStyle: {
                color: selectedCategory === 'Tools' ? '#000' : '#fff',
                fontWeight: 'bold',
              },
            },
          ]}
        />
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
                        case 'Tools':
                          return (
                            <Image
                              source={require('../assets/tool.png')}
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
                title='No equipment available for use'
                description='The list/database is empty.'
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
                    source={
                      selectedItem?.Image_URL
                        ? { uri: selectedItem?.Image_URL }
                        : require('../assets/A2K-LOGO.png')
                    }
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
                  {/* <InfoRow label='ID' value={selectedItem?.Laptop_ID} />
                  <InfoRow label='Brand' value={selectedItem?.Laptop_Brand} />
                  <InfoRow label='Model' value={selectedItem?.Laptop_Model} /> */}
                  <Divider />
                  {/* <InfoRow
                    label='Description'
                    value={selectedItem?.Laptop_Description}
                  /> */}
                  <Text style={styles.whiteText}>Description:</Text>
                  <Paragraph style={styles.whiteText}>
                    {selectedItem?.Laptop_Description}
                  </Paragraph>
                  {/* Borrow Button with loading and disabled props */}
                  <Divider />

                  <View style={{ flexDirection: 'row', flex: 1 }}>
                    {isAdmin() && (
                      <Button
                        icon='briefcase-edit'
                        mode='contained'
                        onPress={openEdit}
                        style={styles.optionButton}
                      >
                        Edit
                      </Button>
                    )}
                    {isAdmin() && (
                      <Button
                        icon='delete'
                        mode='contained'
                        onPress={openDelete}
                        style={styles.optionButton}
                      >
                        Delete
                      </Button>
                    )}
                  </View>

                  {isAdmin() && (
                    <Button
                      mode='contained'
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
                      mode='contained'
                      onPress={requestLaptopHandler}
                      style={styles.borrowButton}
                      disabled={borrowButtonDisabled}
                      loading={borrowLoading}
                    >
                      Request
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
          <Modal
            visible={successModalVisible}
            onRequestClose={closeSuccessModal}
          >
            <View style={styles.successModalContent}>
              <List.Icon icon='check-circle' color='#4CAF50' size={48} />
              <Title>Success</Title>
              {isBorrow() && (
                <Paragraph style={styles.successModalText}>
                  Equipment borrowed successfully!
                </Paragraph>
              )}
              {isRequest() && (
                <Paragraph style={styles.successModalText}>
                  Equipment Requested successfully!
                </Paragraph>
              )}
              {isAdd() && (
                <Paragraph style={styles.successModalText}>
                  Equipment added successfully!
                </Paragraph>
              )}
              {isDelete() && (
                <Paragraph style={styles.successModalText}>
                  Equipment deleted successfully!
                </Paragraph>
              )}
              {isEdit() && (
                <Paragraph style={styles.successModalText}>
                  Equipment edited successfully!
                </Paragraph>
              )}
              {isBorrow() && (
                <View style={styles.borrowDateTime}>
                  <List.Icon icon='calendar' color='#2196F3' size={24} />
                  <Paragraph style={styles.infoValue}>
                    {new Date().toLocaleString()}
                  </Paragraph>
                </View>
              )}
              <Button onPress={closeSuccessModal} style={styles.closeButton}>
                Close
              </Button>
            </View>
          </Modal>
          <Modal animationType='fade' visible={addVisible}>
            <LinearGradient
              colors={['#242A3E', '#191D2B', '#0F1016']}
              style={styles.flexview}
            >
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalBox}>
                  {isAdd() && (
                    <Text
                      variant='headlineMedium'
                      style={[
                        styles.modalHeaderText,
                        { textAlign: 'center', color: '#FFFFFF' },
                      ]}
                    >
                      Add item
                    </Text>
                  )}
                  {isEdit() && (
                    <Text
                      variant='headlineMedium'
                      style={[
                        styles.modalHeaderText,
                        { textAlign: 'center', color: '#FFFFFF' },
                      ]}
                    >
                      Edit Item
                    </Text>
                  )}
                  {isDelete() && (
                    <Text
                      variant='headlineMedium'
                      style={[
                        styles.modalHeaderText,
                        { textAlign: 'center', color: '#FFFFFF' },
                      ]}
                    >
                      Delete item
                    </Text>
                  )}
                  <Divider />
                  {errorMsg && (
                    <Text style={{ color: 'red', marginVertical: 5 }}>
                      {errorMsg}
                    </Text>
                  )}

                  <TextInput
                    mode='flat'
                    disabled={disabled}
                    label='ID'
                    style={styles.input}
                    value={inputID}
                    onChangeText={(text) => {
                      setInputID(text);
                      setShowError(false); // Reset the error message when input changes
                    }}
                  />
                  {showError && (
                    <Text style={{ color: 'red' }}>
                      ID already exists. Please enter a different ID.
                    </Text>
                  )}
                  <TextInput
                    mode='flat'
                    disabled={delDisable}
                    label='Equipment Name'
                    style={styles.input}
                    value={inputName}
                    onChangeText={(text) => {
                      setInputName(text);
                      console.log(inputName);
                    }}
                  />
                  <TextInput
                    disabled={delDisable}
                    mode='flat'
                    label='Brand'
                    style={styles.input}
                    value={inputBrand}
                    onChangeText={(text) => {
                      setInputBrand(text);
                      console.log(inputBrand);
                    }}
                  />
                  <TextInput
                    disabled={delDisable}
                    mode='flat'
                    label='Model'
                    style={styles.input}
                    value={inputModel}
                    onChangeText={(text) => {
                      setInputModel(text);
                      console.log(inputModel);
                    }}
                  />

                  <TextInput
                    disabled={delDisable}
                    mode='flat'
                    label='Description'
                    style={styles.input}
                    value={inputDesc}
                    onChangeText={(text) => {
                      setInputDesc(text);
                      console.log(inputDesc);
                    }}
                  />
                  {/* <TextInput
                    mode='flat'
                    label='Category'
                    value={inputCategory}
                    style={styles.input}
                    onChangeText={(text) => {
                      setInputCategory(text);
                      console.log(inputCategory);
                    }}
                  /> */}

                  {!delDisable && (
                    <SelectList
                      placeholder='Category'
                      boxStyles={styles.input}
                      dropdownStyles={styles.input}
                      setSelected={(val) => setInputCategory(val)}
                      data={dropItems}
                      save='value'
                      search='false'
                    />
                  )}
                  {isDelete() && (
                    <TextInput
                      disabled={delDisable}
                      mode='flat'
                      label='Category'
                      style={styles.input}
                      value={inputCategory}
                      onChangeText={(text) => {
                        setInputDesc(text);
                        console.log(inputDesc);
                      }}
                    />
                  )}
                  <View>
                    <Text style={styles.whiteText}>Attach Image</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                      }}
                    >
                      {!image ? (
                        <>
                          <TouchableRipple
                            style={styles.imageContainer}
                            onPress={pickImage}
                          >
                            <MaterialCommunityIcons
                              name='image'
                              size={100}
                              color='white'
                            />
                          </TouchableRipple>
                          <TouchableRipple
                            style={styles.imageContainer}
                            onPress={takePhoto}
                          >
                            <MaterialCommunityIcons
                              name='camera'
                              size={100}
                              color='white'
                            />
                          </TouchableRipple>
                        </>
                      ) : (
                        <TouchableRipple
                          style={styles.imageContainer}
                          onPress={() => {
                            setImage(null);
                          }}
                        >
                          <View>
                            <Image
                              source={{ uri: image }}
                              style={styles.image}
                            />
                            <MaterialCommunityIcons
                              name='close'
                              size={30}
                              color='white'
                              style={styles.editIcon}
                            />
                          </View>
                        </TouchableRipple>
                      )}
                    </View>
                  </View>

                  <Divider />

                  <Divider />
                  {isAdd() && (
                    <Button
                      disabled={borrowButtonDisabled}
                      loading={borrowLoading}
                      style={styles.closeButton}
                      mode='contained'
                      onPress={addVerifyHandler}
                      icon='plus'
                    >
                      Add Item
                    </Button>
                  )}
                  {isEdit() && (
                    <Button
                      disabled={borrowButtonDisabled}
                      loading={borrowLoading}
                      style={styles.closeButton}
                      mode='contained'
                      onPress={editHandler}
                      icon='briefcase-edit'
                    >
                      Edit Item
                    </Button>
                  )}
                  {isDelete() && (
                    <Button
                      disabled={borrowButtonDisabled}
                      loading={borrowLoading}
                      style={styles.closeButton}
                      mode='contained'
                      onPress={deleteHandler}
                      icon='delete'
                    >
                      Delete item
                    </Button>
                  )}
                  <Button
                    style={styles.closeButton}
                    mode='contained'
                    onPress={() => {
                      setDisabled(false);
                      setDelDisable(false);
                      setAddVisible(false);
                      setErrorMsg(null);

                      setInputID(null);
                      setInputName(null);
                      setInputBrand(null);
                      setInputModel(null);
                      setInputDesc(null);
                      setInputCategory(null);
                      setShowError(false);
                    }}
                  >
                    Close
                  </Button>
                </View>
              </ScrollView>
            </LinearGradient>
          </Modal>
        </View>
      </ScrollView>
      {isAdmin() && (
        <FAB
          style={styles.fab}
          icon='plus'
          size='medium'
          onPress={addModalshow}
        />
      )}
    </LinearGradient>
  );
};

export default LaptopScreen;
