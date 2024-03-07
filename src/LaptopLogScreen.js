import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Modal } from 'react-native';
import {
  List,
  Title,
  Paragraph,
  TouchableRipple,
  Button,
} from 'react-native-paper';
import supabase from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchLogData();
  }, [selectedMonth]);

  const fetchLogData = async () => {
    console.log(selectedMonth);
    try {
      const { data, error } = await supabase
        .from('InventoryLaptopLog')
        .select('*')
        .order('Laptop_SignIn', { ascending: false })
        .eq('LaptopLog_Month', selectedMonth);

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
    }, [selectedMonth])
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
        .eq('LaptopLog_Month', selectedMonth);

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
        [`Laptop Handover log for the month of ${selectedMonth}`],
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
          <Button
            onPress={exportToExcel}
            style={styles.exportButton}
            labelStyle={styles.exportButtonLabel}
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name='file-excel'
                color={color}
                size={size}
              />
            )}
            disabled={exporting}
            loading={exportLoading}
          >
            Export
          </Button>

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
              { label: 'October', value: 'Ocotber' },
              { label: 'November', value: 'November' },
              { label: 'December', value: 'December' },
            ]}
            style={pickerSelectStyles}
            value={selectedMonth}
            useNativeAndroidPickerStyle={false}
          />
        </View>
      ),
    });
  }, [navigation, selectedMonth, exporting]);

  return (
    <View>
      <ScrollView>
        <List.Section>
          {logData.map((item) => (
            <TouchableRipple
              key={item.LaptopLog_ID}
              onPress={() => handleItemPress(item)}
            >
              <List.Item
                title={item.Laptop_Name}
                description={`Borrowed by ${item.Laptop_User}`}
                left={(props) => <List.Icon {...props} icon='laptop' />}
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
            {/* ... other modal content ... */}
            <Button onPress={closeModal} style={styles.closeButton}>
              Close
            </Button>
          </View>
        </ScrollView>
      </Modal>
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
  headerRightContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  exportButton: {
    marginRight: 16,
  },
  exportButtonLabel: {
    color: '#3BC14A', // Customize the color of the export button text
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
});

export default LaptopLogScreen;
