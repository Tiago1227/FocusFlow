import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native'; 

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        {/* AppNavigator agora lida com a lógica de carregamento e autenticação */}
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}