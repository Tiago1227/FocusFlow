import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import DrawerContent from './DrawerContent';
import AppNavigator from './AppNavigator';

const Drawer = createDrawerNavigator();

const MainDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />} 
      screenOptions={{
        headerShown: false, 
        drawerType: 'slide', 
        overlayColor: 'rgba(0, 0, 0, 0.4)', 
        drawerStyle: {
          width: '80%', 
        },
      }}
    >
      <Drawer.Screen name="HomeApp" component={AppNavigator} />
    </Drawer.Navigator>
  );
};

export default MainDrawerNavigator;