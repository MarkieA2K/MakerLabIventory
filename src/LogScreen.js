import React, { useState, useEffect } from 'react';
import { View, ScrollView, Modal, RefreshControl } from 'react-native';
import {
  List,
  TouchableRipple,
  FAB,
  Text,
  Divider,
  Button,
} from 'react-native-paper';
import supabase from './supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons icon set
import styles from './styles'; // Importing styles from external file
import RNPickerSelect from 'react-native-picker-select';

const LogScreen = ({ navigation, userData, setLoggedIn }) => {
  const [logData, setLogData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    fetchLogData();
  }, []);

  const fetchLogData = async () => {
    try {
      const { data, error } = await supabase
        .from('InventoryLog')
        .select('*')
        .order('Log_Date', { ascending: false }); // Order by timestamp in descending order

      if (error) {
        console.error('Error fetching log data:', error);
      } else {
        setLogData(data);
      }
    } catch (error) {
      console.error('Error fetching log data:', error.message);
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
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalVisible(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogData();
    setRefreshing(false);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'Add':
        return 'add-circle'; // MaterialIcons icon for Add
      case 'Edit':
        return 'edit'; // MaterialIcons icon for Edit
      case 'Delete':
        return 'delete'; // MaterialIcons icon for Delete
      default:
        return 'info'; // Default icon if action is not recognized
    }
  };
  const getActionColor = (action) => {
    switch (action) {
      case 'Add':
        return '#0000FF'; // MaterialIcons icon for Add
      case 'Edit':
        return '#008000'; // MaterialIcons icon for Edit
      case 'Delete':
        return '#FF0000'; // MaterialIcons icon for Delete
      default:
        return '#EAEAEA'; // Default icon if action is not recognized
    }
  };
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          {/* Month Picker */}
          <RNPickerSelect
            onValueChange={(value) => setSelectedAction(value)}
            items={[
              { label: 'Add', value: 'Add' },
              { label: 'Edit', value: 'Edit' },
              { label: 'Delete', value: 'Delete' },
            ]}
            value={selectedAction}
            useNativeAndroidPickerStyle={false}
          />
        </View>
      ),
    });
  }, [navigation, selectedAction]);

  return (
    <LinearGradient
      colors={['#242A3E', '#191D2B', '#0F1016']}
      style={styles.flexview}
    >
      <View style={styles.flexview}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContentLog}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {logData.map((item) => (
            <TouchableRipple
              key={item.Log_ID}
              onPress={() => handleItemPress(item)}
            >
              <List.Item
                style={styles.listItemLog}
                title={item.Item_Name} // Set the title to the item name
                titleStyle={styles.title}
                description={`${item.Log_Action}ed by ${
                  item.Log_User
                }\n${formatDate(item.Log_Date)}`} // Combine action, user, and date in the description
                descriptionStyle={styles.description}
                left={() => (
                  <MaterialIcons
                    name={getActionIcon(item.Log_Action)}
                    size={60}
                    color={getActionColor(item.Log_Action)} // Customize the color of the icon
                  />
                )}
              />
            </TouchableRipple>
          ))}
        </ScrollView>

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
                  User: {selectedItem?.Log_User}
                </Text>
                <Text style={styles.whiteText}>
                  Date: {formatDate(selectedItem?.Log_Date)}
                </Text>

                <Divider />

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

        {/* FAB for exporting to Excel */}
        <FAB
          style={styles.fab}
          icon='export'
          color='#72E77F' // Customize the background color of the FAB
          onPress={() => {}}
        />
      </View>
    </LinearGradient>
  );
};

export default LogScreen;
