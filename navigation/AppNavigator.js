import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import { useAuth } from '../context/AuthContext';
import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'; 

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddEditTaskScreen from '../screens/AddEditTaskScreen';
import CalendarScreen from '../screens/CalendarScreen'

import DrawerContent from './DrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator(); 

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddEditTask" component={AddEditTaskScreen} />
    </Stack.Navigator>
  );
};

const HomeWithTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = size; 
          let iconColor = focused ? '#8C4DD5' : 'gray'; 

          if (route.name === 'TarefasTab') {
            iconName = 'file-text'; 
          } else if (route.name === 'CalendarioTab') {
            iconName = 'calendar'; 
          }

          return <Feather name={iconName} size={iconSize} color={iconColor} />;
        },
        tabBarActiveTintColor: '#8C4DD5',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 2,
        },
        tabBarShowLabel: false, 
      })}
    >
      <Tab.Screen
        name="TarefasTab"
        component={HomeStack}
        options={{
          title: 'Tarefas',
        }}
        listeners={({ navigation, route }) => ({
          state: (e) => {
            if (route.params?.filterType) {
              navigation.navigate('TarefasTab', { screen: 'Home', params: route.params });
              navigation.setParams({ filterType: undefined, filterValue: undefined });
            }
          },
        })}
      />
      <Tab.Screen
        name="CalendarioTab"
        component={CalendarScreen}
        options={{
          title: 'Calendário',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { currentUser, loading } = useAuth();

  console.log('AppNavigator: currentUser status:', currentUser ? currentUser.email : 'Nenhum usuário logado');
  console.log('AppNavigator: loading status:', loading);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8C4DD5" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      {currentUser ? (
        <Drawer.Navigator
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerPosition: 'left',
            drawerStyle: {
              backgroundColor: '#f7f9fc',
              width: 280,
            },
            overlayColor: 'rgba(0, 0, 0, 0.6)'
          }}
        >
          <Drawer.Screen name="MainAppContent" component={HomeWithTabs} />
        </Drawer.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  shadow: {
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8C4DD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;