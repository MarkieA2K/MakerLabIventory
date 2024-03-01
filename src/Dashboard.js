// Dashboard.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InventoryScreen from './InventoryScreen';
import ScanScreen from './ScanScreen';
import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator();

const Dashboard = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name='Inventory' component={InventoryScreen} />
      <Tab.Screen name='Scan' component={ScanScreen} />
      <Tab.Screen name='Settings' component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default Dashboard;
