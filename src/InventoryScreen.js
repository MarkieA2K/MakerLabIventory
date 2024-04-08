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
  Text,
  TextInput,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderNav from './component/HeaderNav';
import styles from './styles';
import supabase from './supabase';

import { SelectList } from 'react-native-dropdown-select-list';

const InventoryScreen = ({ navigation, userData, setLoggedIn }) => {
  const [inventoryData, setInventoryData] = useState([]);
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

  const dropItems = [
    { label: 'Furniture', value: 'Furniture' },
    { label: 'Appliance', value: 'Appliance' },
    { label: 'Peripheral', value: 'Peripheral' },

    { label: 'Other', value: 'Other' },
  ];

  const isAdd = () => modalMode === 'Add';
  const isDelete = () => modalMode === 'Delete';
  const isEdit = () => modalMode === 'Edit';
  const isAdmin = () => userData?.User_Level === 'ADMIN';
  const isOJT = () => userData?.User_Level === 'OJT';

  const fetchInventoryData = async () => {
    try {
      const { data, error } = await supabase.from('InventoryList').select('*');

      if (error) {
        console.error('Error fetching inventory data:', error);
      } else {
        setInventoryData(data);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error.message);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchInventoryData();
    }, [selectedCategory])
  );

  const handleItemPress = async (item) => {
    try {
      setSelectedItem(item);
      setModalVisible(true);
    } catch (error) {
      console.error('Error handling item press:', error.message);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const closeSuccessModal = () => {
    setModalMode(null);
    setSuccessModalVisible(false);
    setAddVisible(false);
    fetchInventoryData();
  };

  const addModalshow = () => {
    setModalMode('Add');
    setAddVisible(true);
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
        !inputCategory
      ) {
        setErrorMsg('All fields are required');
        return; // Exit the function early if any field is empty
      }

      // Call the function to add the laptop item
      addItem();
    } catch (error) {
      console.error('Error verifying form data:', error.message);
      // Handle other types of errors here
    }
  };
  const addItem = async () => {
    setBorrowButtonDisabled(true);
    setBorrowLoading(true);
    try {
      // Proceed with inserting the laptop item into the database
      const { data, error } = await supabase.from('InventoryList').insert([
        {
          Item_Id: inputID,
          Item_Name: inputName,
          Item_Brand: inputBrand,
          Item_Model: inputModel,
          Item_Description: inputDesc,
          Item_Category: inputCategory,
          Item_Quantity: 1, // Assuming the default quantity is 1 for a new item
        },
      ]);

      if (error) {
        if (
          error.code === '23505' &&
          error.constraint === 'InventoryLaptopList_Laptop_ID_key'
        ) {
          console.log('Duplicate key violation');
        } else {
          console.error('Error adding laptop item:', error.message);
          setShowError(true);
          // Handle other types of errors here
        }
      } else {
        console.log('item added successfully:', data);
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
        // Close the modal after adding the item
        setAddVisible(false);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error adding laptop item:', error.message);
      // Handle other types of errors here
    }
  };

  const getItemImage = (category) => {
    switch (category) {
      case 'Laptop':
        return require('../assets/LaptopPic.png');
      case 'Headphones':
        return require('../assets/HeadphonesPic.png');
      default:
        return require('../assets/A2K-LOGO.png');
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
            onRefresh={fetchInventoryData}
          />
        }
      >
        <View>
          <List.Section>
            {inventoryData.length > 0 ? (
              inventoryData.map((item) => (
                <TouchableRipple
                  key={item.Item_Id}
                  onPress={() => handleItemPress(item)}
                >
                  <List.Item
                    title={item.Item_Name}
                    description={item.Item_Description}
                    left={() => (
                      <Image
                        source={getItemImage(item.Item_Category)}
                        style={styles.icon}
                      />
                    )}
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
                    {selectedItem?.Item_Name}
                  </Text>
                  <Divider />
                  <Text style={styles.whiteText}>
                    ID: {selectedItem?.Item_Id}
                  </Text>
                  <Text style={styles.whiteText}>
                    Brand: {selectedItem?.Item_Brand}
                  </Text>
                  <Text style={styles.whiteText}>
                    Model: {selectedItem?.Item_Model}
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
                    {selectedItem?.Item_Description}
                  </Paragraph>
                  {/* Borrow Button with loading and disabled props */}
                  <Divider />

                  <View style={{ flexDirection: 'row', flex: 1 }}>
                    <Button
                      icon='briefcase-edit'
                      mode='contained'
                      // onPress={openEdit}
                      style={styles.optionButton}
                    >
                      Edit
                    </Button>
                    <Button
                      icon='delete'
                      mode='contained'
                      // onPress={openDelete}
                      style={styles.optionButton}
                    >
                      Delete
                    </Button>
                  </View>

                  {isAdmin() && (
                    <Button
                      mode='contained'
                      // onPress={borrowLaptopHandler}
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
                      // onPress={requestLaptopHandler}
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
            {/* Your success modal content */}
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
                      // onPress={editHandler}
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
                      // onPress={deleteHandler}
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

export default InventoryScreen;
