import React, { useState, useEffect } from 'react';
import { View, ScrollView, Modal, RefreshControl } from 'react-native';
import {
  List,
  TouchableRipple,
  FAB,
  Text,
  Divider,
  Button,
  SegmentedButtons,
} from 'react-native-paper';
import supabase from './supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons icon set
import styles from './styles'; // Importing styles from external file
import RNPickerSelect from 'react-native-picker-select';
import HeaderNav from './component/HeaderNav';

const LogScreen = ({ navigation, userData, setLoggedIn }) => {
  const [logData, setLogData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    fetchLogData();
  }, [selectedAction]);

  const fetchLogData = async () => {
    try {
      let query = supabase.from('InventoryLog').select('*');
      if (selectedAction) {
        query = query.eq('Log_Action', selectedAction);
      }

      const { data, error } = await query
        .select('*')
        .order('Log_Date', { ascending: false });

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
        return '#0000FF'; // Blue for Add
      case 'Edit':
        return '#008000'; // Green for Edit
      case 'Delete':
        return '#FF0000'; // Red for Delete
      default:
        return '#EAEAEA'; // Default gray for unrecognized actions
    }
  };

  const handleActionChange = (value) => {
    setSelectedAction(selectedAction === value ? null : value);
  };

  return (
    <LinearGradient
      colors={['#242A3E', '#191D2B', '#0F1016']}
      style={styles.flexview}
    >
      <HeaderNav userData={userData} setLoggedIn={setLoggedIn} />
      <View style={styles.flexview}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <SegmentedButtons
            style={{ paddingHorizontal: 30, marginVertical: 10 }}
            value={selectedAction}
            onValueChange={handleActionChange}
            buttons={[
              {
                value: 'Add',
                label: 'Add',
                style: {
                  backgroundColor: selectedAction === 'Add' ? '#fff' : '#333', // Light background for selected, dark for others
                  borderColor: '#fff', // White border
                  borderWidth: 1,
                },
                labelStyle: {
                  color: selectedAction === 'Add' ? '#000' : '#fff', // Black text for selected, white for others
                  fontWeight: 'bold', // Bold text
                },
              },
              {
                value: 'Delete',
                label: 'Delete',
                style: {
                  backgroundColor:
                    selectedAction === 'Delete' ? '#fff' : '#333',
                  borderColor: '#fff',
                  borderWidth: 1,
                },
                labelStyle: {
                  color: selectedAction === 'Delete' ? '#000' : '#fff',
                  fontWeight: 'bold',
                },
              },
              {
                value: 'Edit',
                label: 'Edit',
                style: {
                  backgroundColor: selectedAction === 'Edit' ? '#fff' : '#333',
                  borderColor: '#fff',
                  borderWidth: 1,
                },
                labelStyle: {
                  color: selectedAction === 'Edit' ? '#000' : '#fff',
                  fontWeight: 'bold',
                },
              },
              {
                value: 'Use',
                label: 'Use',
                style: {
                  backgroundColor: selectedAction === 'Use' ? '#fff' : '#333',
                  borderColor: '#fff',
                  borderWidth: 1,
                },
                labelStyle: {
                  color: selectedAction === 'Use' ? '#000' : '#fff',
                  fontWeight: 'bold',
                },
              },
            ]}
          />

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
                  Action: {selectedItem?.Log_Action}
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
