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
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SelectList } from 'react-native-dropdown-select-list';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';

const InventoryScreen = ({ navigation, userData, setLoggedIn }) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [borrowButtonDisabled, setBorrowButtonDisabled] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);

  const [addVisible, setAddVisible] = useState(false);
  const [inputID, setInputID] = useState(null);
  const [inputName, setInputName] = useState(null);
  const [inputBrand, setInputBrand] = useState(null);
  const [inputModel, setInputModel] = useState(null);
  const [inputDesc, setInputDesc] = useState(null);
  const [inputQuantity, setInputQuantity] = useState(null);
  const [showError, setShowError] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [inputCategory, setInputCategory] = useState(null);
  const [inputSubCategory, setInputSubCategory] = useState(null);
  const [inputFacility, setInputFacility] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [delDisable, setDelDisable] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showDropDown, setShowDropDown] = useState(false);
  const [image, setImage] = useState();

  const dropItems = [
    { label: 'Furniture', value: 'Furniture' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Utility', value: 'Utility' },
    { label: 'Other', value: 'Other' },
  ];

  const furnitureSubCategory = [
    { label: 'Table', value: 'Table' },
    { label: 'Chair', value: 'Chair' },
    { label: 'Storage', value: 'Storage' },
    { label: 'Other', value: 'Other' },
  ];
  const utilitySubCategory = [
    { label: 'Tools', value: 'Tools' },
    { label: 'Safety', value: 'Safety' },
    { label: 'First Aid', value: 'First Aid' },

    { label: 'Other', value: 'Other' },
  ];

  const electronicsSubCategory = [
    { label: 'Monitor', value: 'Monitor' },
    { label: 'Cable', value: 'Cable' },
    { label: 'Accessory', value: 'Accessory' },
    { label: 'Other', value: 'Other' },
  ];

  const otherSubCategory = [{ label: 'Other', value: 'Other' }];

  const getSubcategoryData = () => {
    switch (inputCategory) {
      case 'Furniture':
        return furnitureSubCategory;
      case 'Electronics':
        return electronicsSubCategory;
      case 'Utility':
        return utilitySubCategory;
      case 'Other':
        return otherSubCategory;
      default:
        return [];
    }
  };

  const dropItemsFacility = [
    { label: 'MakerLab', value: 'MakerLab' },
    { label: 'Training Hub', value: 'Training Hub' },
    { label: 'Reception', value: 'Reception' },
    { label: 'Dining Hall', value: 'Dining Hall' },
    { label: 'Conference Room', value: 'Conference Room' },
    { label: 'Others', value: 'Others' },
  ];

  const isAdd = () => modalMode === 'Add';
  const isDelete = () => modalMode === 'Delete';
  const isEdit = () => modalMode === 'Edit';
  const isAdmin = () => userData?.User_Level === 'ADMIN';
  const isOJT = () => userData?.User_Level === 'OJT';

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
      base64: true,
    });

    if (!result.cancelled) {
      const imageBase64 = 'data:image/jpeg;base64,' + result.assets[0].base64;

      setImage(imageBase64);
      console.log(image);
    }
  };
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const imageBase64 = 'data:image/jpeg;base64,' + result.assets[0].base64;
      setImage(imageBase64);
      // Now this will log the image base64 string
    }
  };
  const fetchInventoryData = async () => {
    try {
      let query = supabase.from('InventoryList').select('*');
      if (selectedCategory) {
        query = query.eq('Item_Category', selectedCategory);
      }
      if (selectedFacility) {
        query = query.eq('Item_Facility', selectedFacility);
      }
      const { data, error } = await query.select('*');

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
  }, [selectedCategory, selectedFacility]);

  const handleItemPress = async (item) => {
    try {
      setSelectedItem(item);
      setModalVisible(true);
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
    setModalMode(null);
    setSuccessModalVisible(false);
    setAddVisible(false);
    fetchInventoryData();
  };
  const openEdit = () => {
    setBorrowButtonDisabled(false);
    setBorrowLoading(false);
    console.log('EDIT NA');
    setModalMode('Edit');
    setAddVisible(true);
    setDisabled(true);
    setInputID(selectedItem ? selectedItem.Item_Id : null); ///error here chatgpt
    setInputName(selectedItem ? selectedItem.Item_Name : null);
    setInputBrand(selectedItem ? selectedItem.Item_Brand : null);
    setInputModel(selectedItem ? selectedItem.Item_Model : null);
    setInputDesc(selectedItem ? selectedItem.Item_Description : null);
    setInputCategory(selectedItem ? selectedItem.Item_Category : null);
    setInputSubCategory(selectedItem ? selectedItem.Item_SubCategory : null);
    setInputQuantity(selectedItem ? selectedItem.Item_Quantity : null);
    setInputFacility(selectedItem ? selectedItem.Item_Facility : null);
  };
  const openDelete = () => {
    setDelDisable(true);

    setBorrowButtonDisabled(false);
    setBorrowLoading(false);
    console.log('EDIT NA');
    setModalMode('Delete');
    setAddVisible(true);
    setDisabled(true);
    setInputID(selectedItem ? selectedItem.Item_Id : null); ///error here chatgpt
    setInputName(selectedItem ? selectedItem.Item_Name : null);
    setInputBrand(selectedItem ? selectedItem.Item_Brand : null);
    setInputModel(selectedItem ? selectedItem.Item_Model : null);
    setInputDesc(selectedItem ? selectedItem.Item_Description : null);
    setInputQuantity(selectedItem ? selectedItem.Item_Quantity : null);
    setInputCategory(selectedItem ? selectedItem.Item_Category : null);
    setInputSubCategory(selectedItem ? selectedItem.Item_Category : null);
    setInputFacility(selectedItem ? selectedItem.Item_Facility : null);
  };

  const addModalshow = () => {
    setModalMode('Add');
    setAddVisible(true);
  };

  const clearAll = () => {
    setInputID(null);
    setInputName(null);
    setInputBrand(null);
    setInputModel(null);
    setInputDesc(null);
    setInputCategory(null);
    setInputSubCategory(null);
    setInputFacility(null);
    setInputQuantity(null);
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
        !inputFacility ||
        !inputCategory ||
        !inputSubCategory ||
        !inputQuantity
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
          Item_SubCategory: inputSubCategory,
          Item_Facility: inputFacility,
          Item_Quantity: inputQuantity,
          Item_User: userData?.User_DisplayName,
          Date_Added: new Date(),
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
        await addToInventoryLog('Add', inputID, inputName);
        console.log('item added successfully:', data);
        // Optionally, you can update the local state to reflect the newly added item
        // For example, you can call fetchLaptopData() to refresh the laptop data
        setBorrowButtonDisabled(false);

        setBorrowLoading(false);
        setSuccessModalVisible(true);

        // Clear the input fields after successful addition
        clearAll();
        // Close the modal after adding the item
        setAddVisible(false);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error adding laptop item:', error.message);
      // Handle other types of errors here
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
        !inputFacility ||
        !inputCategory ||
        !inputSubCategory ||
        !inputQuantity
      ) {
        setErrorMsg('All fields are required');
        setBorrowButtonDisabled(false);
        setBorrowLoading(false);
        return; // Exit the function early if any field is empty
      }

      // Proceed with updating the laptop item in the database
      const { data, error } = await supabase
        .from('InventoryList')
        .update({
          Item_Name: inputName,
          Item_Brand: inputBrand,
          Item_Model: inputModel,
          Item_Description: inputDesc,
          Item_Category: inputCategory,
          Item_SubCategory: inputSubCategory,
          Item_Facility: inputFacility,
          Item_Quantity: inputQuantity,
        })
        .eq('Item_Id', inputID);

      if (error) {
        setErrorMsg('Error editing laptop item: ' + error.message);
        // Handle error here
      } else {
        await addToInventoryLog('Edit', inputID, inputName);
        console.log('Laptop item edited successfully:', data);
        setBorrowButtonDisabled(false);
        setBorrowLoading(false);
        setDisabled(false);
        setErrorMsg(null);
        // Optionally, you can update the local state to reflect the changes
        // For example, you can call fetchLaptopData() to refresh the laptop data
        setSuccessModalVisible(true);

        // Clear the input fields after successful edition
        clearAll();
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
        .from('InventoryList')
        .delete()
        .eq('Item_Id', selectedItem?.Item_Id);

      if (error) {
        console.error('Error deleting laptop item:', error.message);
      } else {
        await addToInventoryLog(
          'Delete',
          selectedItem?.Item_Id,
          selectedItem?.Item_Name
        );
        console.log('Laptop item deleted successfully:', data);
        clearAll();
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
  const addToInventoryLog = async (modalMode, itemId, itemName) => {
    try {
      const logData = {
        Item_Id: itemId,
        Item_Name: itemName,
        Log_Date: new Date().toISOString(),
        Log_User: userData?.User_DisplayName,
        Log_Action: modalMode,
      };

      const { data, error } = await supabase
        .from('InventoryLog')
        .insert([logData]);

      if (error) {
        console.error('Error adding to InventoryLog:', error.message);
      } else {
        console.log('Added to InventoryLog:', data);
      }
    } catch (error) {
      console.error('Error adding to InventoryLog:', error.message);
    }
  };

  const getItemImage = (category) => {
    switch (category) {
      case 'Furniture':
        return require('../assets/Furniture.png');
      case 'Electronics':
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
          <View
            style={{
              flexDirection: 'row',
              margin: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.13)',
              padding: 20,
              marginHorizontal: 30,
              borderRadius: 30,

              justifyContent: 'space-evenly',
            }}
          >
            {/* <SelectList
              placeholder='Select Facility'
              boxStyles={styles.filterInput}
              dropdownStyles={styles.input}
              setSelected={setSelectedFacility}
              data={dropItemsFacility}
              save='value'
            />    
            <SelectList
              placeholder='Select Category'
              boxStyles={styles.filterInput}
              dropdownStyles={styles.input}
              setSelected={setSelectedCategory}
              data={dropItems}
              save='value'
            /> */}
            {/* <Dropdown
              data={dropItemsFacility}
              labelField='label'
              valueField='value'
              value={selectedFacility}
              onChange={(value) => setSelectedFacility(value)}
            /> */}
            {/* <DropDown
              label={'Facility'}
              mode={'outlined'}
              visible={showDropDown}
              showDropDown={() => setShowDropDown(true)}
              onDismiss={() => setShowDropDown(false)}
              value={selectedFacility}
              setValue={setSelectedFacility}
              list={dropItemsFacility}
            /> */}

            <RNPickerSelect
              onValueChange={(value) => setSelectedFacility(value)}
              items={dropItemsFacility}
              style={pickerSelectStyles}
              value={selectedFacility}
              useNativeAndroidPickerStyle={false}
            />

            <RNPickerSelect
              onValueChange={(value) => setSelectedCategory(value)}
              items={dropItems}
              style={pickerSelectStyles}
              value={selectedCategory}
              useNativeAndroidPickerStyle={false}
            />
          </View>
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
                    left={() => {
                      let iconName;
                      switch (item.Item_SubCategory) {
                        case 'Table':
                          iconName = 'table-furniture'; // Using "table-furniture" icon for the table subcategory
                          break;
                        case 'Chair':
                          iconName = 'chair-rolling';
                          break;
                        case 'Storage':
                          iconName = 'archive';
                          break;
                        case 'Other':
                          iconName = 'dots-horizontal';
                          break;
                        case 'Tools':
                          iconName = 'tools';
                          break;
                        case 'Safety':
                          iconName = 'fire-extinguisher';
                          break;
                        case 'First Aid':
                          iconName = 'medical-bag';
                          break;
                        case 'Monitor':
                          iconName = 'desktop-mac-dashboard';
                          break;
                        case 'Cable':
                          iconName = 'usb-port';
                          break;
                        case 'Accessory':
                          iconName = 'lightbulb-on';
                          break;
                        default:
                          iconName = 'help';
                          break;
                      }
                      return (
                        <MaterialCommunityIcons
                          name={iconName}
                          size={100}
                          color='black'
                        />
                      );
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
                  <Text style={styles.whiteText}>
                    Facility: {selectedItem?.Item_Facility}
                  </Text>
                  <Text style={styles.whiteText}>
                    Category: {selectedItem?.Item_Category}
                  </Text>
                  <Text style={styles.whiteText}>
                    Sub Category: {selectedItem?.Item_SubCategory}
                  </Text>
                  <Text style={styles.whiteText}>
                    Quantity: {selectedItem?.Item_Quantity}
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
                      onPress={openEdit}
                      style={styles.optionButton}
                    >
                      Edit
                    </Button>
                    <Button
                      icon='delete'
                      mode='contained'
                      onPress={openDelete}
                      style={styles.optionButton}
                    >
                      Delete
                    </Button>
                  </View>

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

                  <TextInput
                    disabled={delDisable}
                    mode='flat'
                    label='Quantity'
                    style={styles.input}
                    value={inputQuantity !== null ? String(inputQuantity) : ''}
                    keyboardType='numeric' // Only allows numeric input
                    onChangeText={(text) => {
                      // Allow only numbers
                      const quantity = text.replace(/[^0-9]/g, '');
                      setInputQuantity(quantity);
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
                      placeholder='Facility'
                      boxStyles={styles.input}
                      dropdownStyles={styles.input}
                      setSelected={(val) => setInputFacility(val)}
                      data={dropItemsFacility}
                      save='value'
                    />
                  )}
                  {!delDisable && (
                    <SelectList
                      placeholder='Category'
                      boxStyles={styles.input}
                      dropdownStyles={styles.input}
                      setSelected={(val) => setInputCategory(val)}
                      data={dropItems}
                      save='value'
                    />
                  )}
                  {!delDisable && (
                    <SelectList
                      placeholder='Sub Category'
                      boxStyles={styles.input}
                      dropdownStyles={styles.input}
                      setSelected={(val) => setInputSubCategory(val)}
                      data={getSubcategoryData()}
                      save='value'
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
                  {isDelete() && (
                    <TextInput
                      disabled={delDisable}
                      mode='flat'
                      label='Facility'
                      style={styles.input}
                      value={inputFacility}
                      onChangeText={(text) => {
                        setInputDesc(text);
                        console.log(inputDesc);
                      }}
                    />
                  )}

                  <Text style={styles.whiteText}>Attatch Image</Text>
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
                          <Image source={{ uri: image }} style={styles.image} />
                          <MaterialCommunityIcons
                            name='cancel'
                            size={30}
                            color='white'
                            style={styles.editIcon}
                          />
                        </View>
                      </TouchableRipple>
                    )}
                  </View>

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
                      clearAll();
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
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    flex: 1,

    margin: 15,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
  },
  inputAndroid: {
    flex: 1,

    margin: 15,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
  },
});

export default InventoryScreen;
