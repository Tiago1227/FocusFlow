import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';
import MainDrawerNavigator from './navigation/MainDrawerNavigator';

const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth(); 

  if (loading) {
    return null; // Ou <SplashScreen />
  }
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainDrawerNavigator /> : <AuthNavigator />} 
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider> 
      <RootNavigator />
    </AuthProvider>
  );
}