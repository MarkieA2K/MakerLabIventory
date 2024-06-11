import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Modal, Image } from 'react-native';
import {
  List,
  Title,
  Paragraph,
  TouchableRipple,
  FAB,
  Button,
  Text,
  Divider,
} from 'react-native-paper';
import supabase from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { Entypo } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from './component/HeaderLog';
import { SelectList } from 'react-native-dropdown-select-list';
import HeaderNav from './component/HeaderNav';

import styles from './styles';
const LaptopLogScreen = ({ navigation, userData, setLoggedIn }) => {
  const [logData, setLogData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  // State variables for month and year
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  const [exportLoading, setExportLoading] = useState(false);

  const fetchLogData = async () => {
    try {
      const { data, error } = await supabase
        .from('InventoryLaptopLog')
        .select('*')
        .order('Laptop_SignIn', { ascending: false })
        .eq('LaptopLog_Month', selectedMonth)
        .eq('LaptopLog_Year', selectedYear.toString()); // Filter by selected year

      if (error) {
        console.error('Error fetching log data:', error);
      } else {
        setLogData(data);
      }
    } catch (error) {
      console.error('Error fetching log data:', error.message);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchLogData();
    }, [selectedMonth, selectedYear])
  );

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };
  const exportToExcel = async () => {
    setExporting(true);
    setExportLoading(true);

    try {
      // Fetch data from Supabase
      const { data, error } = await supabase
        .from('InventoryLaptopLog')
        .select('Laptop_Name, Laptop_User, Laptop_SignOut, Laptop_SignIn')
        .eq('LaptopLog_Month', selectedMonth)
        .eq('LaptopLog_Year', selectedYear.toString()); // Filter by selected year

      if (error) {
        console.error('Error fetching data:', error);
        return;
      }

      // Prepare data for Excel
      const formattedData = data.map((item) => [
        item.Laptop_Name,
        item.Laptop_User,
        formatDate(item.Laptop_SignOut),
        formatDate(item.Laptop_SignIn),
      ]);

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet([
        [
          `Laptop Handover log for the month of ${selectedMonth} ${selectedYear}`,
        ],
        ['Laptop Name', 'User', 'Sign Out', 'Sign In'],
        ...formattedData,
      ]);

      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

      ws['!rows'] = [{ hpx: 40 }]; // Set row height
      ws['!cols'] = [
        { wch: 20 }, // Set column width for 'Laptop Name'
        { wch: 20 }, // Set column width for 'User'
        { wch: 20 }, // Set column width for 'Sign Out'
        { wch: 20 }, // Set column width for 'Sign In'
      ];

      // Add filter to the worksheet
      ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }),
      };

      // Generate a temporary file path
      const filePath = `${FileSystem.documentDirectory}InventoryLaptopLog.xlsx`;

      // Write the workbook to a file
      await FileSystem.writeAsStringAsync(
        filePath,
        XLSX.write(
          {
            Sheets: { InventoryLaptopLog: ws },
            SheetNames: ['InventoryLaptopLog'],
          },
          { bookType: 'xlsx', type: 'base64' }
        ),
        { encoding: FileSystem.EncodingType.Base64 }
      );

      // Share the file
      await Sharing.shareAsync(filePath, {
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Share Excel File',
        UTI: 'com.microsoft.excel.xlsx',
      });

      Alert.alert('Export Successful', 'The data has been exported to Excel.');
      setExportLoading(false);
    } catch (error) {
      console.error('Error exporting data:', error.message);
      Alert.alert('Export Failed', 'There was an error exporting the data.');
    } finally {
      setExporting(false);
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
      <View style={styles.flexview}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
            <SelectList
              placeholder='Select Month'
              boxStyles={styles.filterInput}
              dropdownStyles={styles.input}
              setSelected={setSelectedMonth}
              data={[
                { label: 'January', value: 'January' },
                { label: 'February', value: 'February' },
                { label: 'March', value: 'March' },
                { label: 'April', value: 'April' },
                { label: 'May', value: 'May' },
                { label: 'June', value: 'June' },
                { label: 'July', value: 'July' },
                { label: 'August', value: 'August' },
                { label: 'September', value: 'September' },
                { label: 'October', value: 'October' },
                { label: 'November', value: 'November' },
                { label: 'December', value: 'December' },
              ]}
              save='value'
            />

            <SelectList
              placeholder='Select Year'
              boxStyles={styles.filterInput}
              dropdownStyles={styles.input}
              setSelected={setSelectedYear}
              data={[
                { label: '2024', value: '2024' },
                { label: '2025', value: '2025' },
                { label: '2026', value: '2026' },
                // Add more years as needed
              ]}
              save='value'
            />
          </View>
          <List.Section>
            {logData.length > 0 ? (
              logData.map((item) => (
                <TouchableRipple
                  key={item.LaptopLog_ID}
                  onPress={() => handleItemPress(item)}
                >
                  <List.Item
                    style={styles.listItem}
                    descriptionStyle={styles.description}
                    title={item.Laptop_Name}
                    titleStyle={styles.title}
                    description={`Returned by: ${
                      item.Laptop_User
                    } \n ${formatDate(item?.Laptop_SignIn)}`}
                    // {`Borrowed by ${item.Laptop_User}`}
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
                  />
                </TouchableRipple>
              ))
            ) : (
              <List.Item
                title='No equipment logged'
                description='There are no equipment logs available.'
                style={styles.emptyList}
                titleStyle={styles.title}
                descriptionStyle={styles.emptyDescription}
              />
            )}
          </List.Section>
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
                  User: {selectedItem?.Laptop_User}
                </Text>
                <Text style={styles.whiteText}>
                  Borrowed: {formatDate(selectedItem?.Laptop_SignOut)}
                </Text>
                <Text style={styles.whiteText}>
                  Retruned: {formatDate(selectedItem?.Laptop_SignIn)}
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
          icon={({ size, color }) => (
            <Entypo name='export' size={size} color={color} />
          )}
          color='#72E77F' // Customize the background color of the FAB
          onPress={exportToExcel}
          loading={exportLoading}
          disabled={exporting}
        />
      </View>
    </LinearGradient>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
  },
  inputAndroid: {
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

export default LaptopLogScreen;
