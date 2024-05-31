import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, FAB, Modal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons icon set
import styles from './styles'; // Importing styles from external file
import HeaderNav from './component/HeaderNav';
import { useFocusEffect } from '@react-navigation/native';
import supabase from './supabase';
import { Entypo } from '@expo/vector-icons';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

const DashboardScreen = ({ navigation, userData, setLoggedIn }) => {
  // State variables for facility, category, and subcategory
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [facilityData, setFacilityData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  // Mock data for facilities
  const facilities = [
    'MakerLab',
    'Dining Hall',
    'Training Hub',
    'Reception',
    'Conference Room',
  ];

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  const fetchFacilityData = async () => {
    try {
      // Fetch data for each facility
      const facilityDataPromises = facilities.map(async (facility) => {
        const { data, error } = await supabase
          .from('InventoryList')
          .select('*')
          .eq('Item_Facility', facility);
        if (error) {
          console.error(`Error fetching data for facility ${facility}:`, error);
          return {
            facility,
            furnitureTotal: 0,
            electronicsTotal: 0,
            utilityTotal: 0,
            otherTotal: 0,
            error,
          };
        } else {
          // Calculate total quantity for each category
          let furnitureTotal = 0;
          let electronicsTotal = 0;
          let utilityTotal = 0; // Add utilityTotal variable
          let otherTotal = 0;
          data.forEach((item) => {
            if (item.Item_Category === 'Furniture') {
              furnitureTotal += item.Item_Quantity;
            } else if (item.Item_Category === 'Electronics') {
              electronicsTotal += item.Item_Quantity;
            } else if (item.Item_Category === 'Utility') {
              // Update for Utility category
              utilityTotal += item.Item_Quantity;
            } else if (item.Item_Category === 'Other') {
              otherTotal += item.Item_Quantity;
            }
          });
          return {
            facility,
            furnitureTotal,
            electronicsTotal,
            utilityTotal,
            otherTotal,
            error: null,
          };
        }
      });

      // Wait for all facility data to be fetched
      const facilityDataResults = await Promise.all(facilityDataPromises);
      setFacilityData(facilityDataResults);

      // Calculate total number of items
      let total = 0;
      facilityDataResults.forEach((facility) => {
        total +=
          facility.furnitureTotal +
          facility.electronicsTotal +
          facility.utilityTotal + // Include utilityTotal in the calculation
          facility.otherTotal;
      });
      setTotalItems(total);
    } catch (error) {
      console.error('Error fetching facility data:', error.message);
    }
  };
  const exportToExcel = async () => {
    try {
      setExportLoading(true);
      // Fetch all data from the InventoryList table
      const { data, error } = await supabase.from('InventoryList').select('*');

      if (error) {
        console.error('Error fetching data:', error);
        return;
      }

      // Prepare data for Excel
      const formattedData = data.map((item) => [
        item.Item_Name,
        item.Item_Category,
        item.Item_Facility,
        item.Item_Quantity,
        formatDate(item.Date_Added), // Assuming this is the Date_Added field
        item.Item_User,
      ]);

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet([
        [
          'Item Name',
          'Category',
          'Facility',
          'Quantity',
          'Date Added',
          'Added by',
        ],
        ...formattedData,
      ]);
      ws['!rows'] = [{ hpx: 40 }]; // Set row height
      ws['!cols'] = [
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
      ];

      // Generate a temporary file path
      const filePath = `${FileSystem.documentDirectory}InventoryListData.xlsx`;

      // Write the workbook to a file
      await FileSystem.writeAsStringAsync(
        filePath,
        XLSX.write(
          {
            Sheets: { InventoryListData: ws },
            SheetNames: ['InventoryListData'],
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
      setExportLoading(false);
      console.log('Export successful');
    } catch (error) {
      console.error('Error exporting data:', error.message);
    }
  };

  useEffect(() => {
    fetchFacilityData();
  }, []); // Fetch data on component mount

  useFocusEffect(
    React.useCallback(() => {
      console.log(facilityData);
      fetchFacilityData();
    }, [])
  );
  return (
    <LinearGradient
      colors={['#242A3E', '#191D2B', '#0F1016']}
      style={styles.flexview}
    >
      <HeaderNav userData={userData} setLoggedIn={setLoggedIn} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.facilitiesContainer}>
          {facilityData.map((facilityItem, index) => (
            <Card key={index} style={styles.facilityCard} mode='contained'>
              <Card.Title
                titleStyle={{ color: '#EAEAEA', alignSelf: 'center' }}
                title={facilityItem.facility}
              />
              <Card.Content>
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.columnStyle}>
                    <Text style={{ color: 'white' }}>Furniture</Text>
                    <Text style={styles.countStyle}>
                      {facilityItem.furnitureTotal}
                    </Text>
                  </View>
                  <View style={styles.columnStyle}>
                    <Text style={{ color: 'white' }}>Electronics</Text>
                    <Text style={styles.countStyle}>
                      {facilityItem.electronicsTotal}
                    </Text>
                  </View>
                  <View style={styles.columnStyle}>
                    <Text style={{ color: 'white' }}>Utility</Text>
                    <Text style={styles.countStyle}>
                      {facilityItem.utilityTotal}
                    </Text>
                  </View>
                  <View style={styles.columnStyle}>
                    <Text style={{ color: 'white' }}>Other</Text>
                    <Text style={styles.countStyle}>
                      {facilityItem.otherTotal}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
          <Card style={styles.facilityCard} mode='elevated'>
            <Card.Title
              title='Total Items'
              titleStyle={{ color: '#EAEAEA', alignSelf: 'center' }}
            />
            <Card.Content>
              <View style={styles.columnStyle}>
                <Text style={styles.countStyle}>{totalItems}</Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      <FAB
        style={styles.fab}
        icon={({ size, color }) => (
          <Entypo name='export' size={size} color={color} />
        )}
        color='#72E77F' // Customize the background color of the FAB
        onPress={exportToExcel}
        loading={exportLoading}
        disabled={exportLoading}
      />
    </LinearGradient>
  );
};

export default DashboardScreen;
