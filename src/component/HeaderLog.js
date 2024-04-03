import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const Header = ({ userData, setLoggedIn }) => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const confirmLogout = () => {
    setLoggedIn(false);
  };

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <View style={styles.userInfo}>
          <Text style={[styles.userLevel, { color: '#EAEAEA' }]}>
            {userData.User_Level}
          </Text>
          <Text style={[styles.userName, { color: '#EAEAEA' }]}>
            {userData.User_DisplayName}
          </Text>
        </View>
      </View>

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
          placeholder={{ label: 'Select month', value: null }}
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
          placeholder={{ label: 'Select year', value: null }}
          style={pickerSelectStyles}
          value={selectedYear}
          useNativeAndroidPickerStyle={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#333333',
    marginTop: 30,
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userLevel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 10,
    marginHorizontal: 20,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default Header;
