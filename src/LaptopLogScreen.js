import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Modal } from 'react-native';
import {
  List,
  Title,
  Paragraph,
  TouchableRipple,
  FAB,
  Button,
} from 'react-native-paper';
import supabase from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { Entypo } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { Alert } from 'react-native';

const LaptopLogScreen = ({ navigation }) => {
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

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          {/* Month Picker */}
          <RNPickerSelect
            onValueChange={(value) => setSelectedMonth(value)}
            items={[
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
            style={pickerSelectStyles}
            value={selectedMonth}
            useNativeAndroidPickerStyle={false}
          />

          {/* Year Picker */}
          <RNPickerSelect
            onValueChange={(value) => setSelectedYear(value)}
            items={[
              { label: '2024', value: '2024' },
              { label: '2025', value: '2025' },
              { label: '2026', value: '2026' },

              // Add more years as needed
            ]}
            style={pickerSelectStyles}
            value={selectedYear}
            useNativeAndroidPickerStyle={false}
          />
        </View>
      ),
    });
  }, [navigation, selectedMonth, selectedYear, exporting]);

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Paragraph style={styles.infoLabel}>{label}</Paragraph>
      <Paragraph style={styles.infoValue}>{value}</Paragraph>
    </View>
  );
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
    <View style={styles.container}>
      <ScrollView>
        <List.Section>
          {logData.map((item) => (
            <TouchableRipple
              key={item.LaptopLog_ID}
              onPress={() => handleItemPress(item)}
            >
              <List.Item
                style={styles.listItem}
                descriptionStyle={styles.description}
                title={item.Laptop_Name}
                description={`Borrowed by ${item.Laptop_User}`}
                left={(props) => (
                  <List.Icon {...props} icon={getCategoryIcon(item.Category)} />
                )}
                right={() => (
                  <View style={styles.rightContent}>
                    <Paragraph>{formatDate(item.Laptop_SignOut)}</Paragraph>
                    <Paragraph>{formatDate(item.Laptop_SignIn)}</Paragraph>
                  </View>
                )}
              />
            </TouchableRipple>
          ))}
        </List.Section>
      </ScrollView>

      <Modal visible={modalVisible} onRequestClose={closeModal}>
        <ScrollView>
          <View style={styles.modalContent}>
            <Title>{selectedItem?.Laptop_Name}</Title>

            {/* Placeholder for Image Frame */}
            <View style={styles.imageFrame} />

            {/* Additional Information */}
            <InfoRow label='Laptop ID' value={selectedItem?.Laptop_ID} />
            <InfoRow label='User' value={selectedItem?.Laptop_User} />
            <InfoRow
              label='Borrowed'
              value={formatDate(selectedItem?.Laptop_SignOut)}
            />
            <InfoRow
              label='Returned'
              value={formatDate(selectedItem?.Laptop_SignIn)}
            />

            {/* Add more fields as needed */}

            <Button onPress={closeModal} style={styles.closeButton}>
              Close
            </Button>
          </View>
        </ScrollView>
      </Modal>

      {/* FAB for exporting to Excel */}
      <FAB
        style={styles.fab}
        icon={({ size, color }) => (
          <Entypo name='export' size={size} color={color} />
        )}
        color='#3BC14A' // Customize the background color of the FAB
        onPress={exportToExcel}
        loading={exportLoading}
        disabled={exporting}
      />
    </View>
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

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
  },
  headerRightContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  modalContent: {
    padding: 16,
  },
  imageFrame: {
    aspectRatio: 1, // Square ratio
    backgroundColor: '#ddd', // Placeholder color
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4D5057',
  },
  closeButton: {
    marginTop: 16,
    marginBottom: 8,
  },
});

export default LaptopLogScreen;
