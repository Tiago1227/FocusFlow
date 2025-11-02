import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; 

import FocusFlowLogo from '../assets/images/logotext.png'; 

const DrawerContent = (props) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", onPress: () => {
          logout(); 
        }, style: "destructive" }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
        {/* Cabeçalho do Drawer */}
        <View style={styles.drawerHeader}>
          <Image source={FocusFlowLogo} style={styles.drawerLogo} resizeMode="contain" />
          <Text style={styles.drawerHeaderText}>Focus Flow</Text>
        </View>

        {/* Itens do Drawer (filtros, etc.) */}
        <Text style={styles.sectionTitle}>Categoria</Text>
        <TouchableOpacity style={styles.drawerItem} onPress={() => Alert.alert('Filtrar', 'Filtrar por Todos')}>
          <Feather name="folder" size={20} color="#555" style={styles.drawerItemIcon} />
          <Text style={styles.drawerItemText}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => Alert.alert('Filtrar', 'Filtrar por Trabalho')}>
          <Feather name="briefcase" size={20} color="#555" style={styles.drawerItemIcon} />
          <Text style={styles.drawerItemText}>Trabalho</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => Alert.alert('Filtrar', 'Filtrar por Pessoal')}>
          <Feather name="home" size={20} color="#555" style={styles.drawerItemIcon} />
          <Text style={styles.drawerItemText}>Pessoal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => Alert.alert('Filtrar', 'Filtrar por Estudo')}>
          <Feather name="book-open" size={20} color="#555" style={styles.drawerItemIcon} />
          <Text style={styles.drawerItemText}>Estudo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => Alert.alert('Ação', 'Criar nova categoria')}>
          <Feather name="plus-square" size={20} color="#555" style={styles.drawerItemIcon} />
          <Text style={styles.drawerItemText}>Criar novo</Text>
        </TouchableOpacity>
        
        {/* Separador */}
        <View style={styles.divider} />

        {/* Tarefas estrela (como um filtro rápido) */}
        <TouchableOpacity style={styles.drawerItem} onPress={() => Alert.alert('Filtrar', 'Ver tarefas estrela')}>
          <Feather name="star" size={20} color="#FFD700" style={styles.drawerItemIcon} />
          <Text style={styles.drawerItemText}>Tarefas estrela</Text>
        </TouchableOpacity>

      </DrawerContentScrollView>

      {/* Seção inferior do Drawer (Botão Sair) */}
      <View style={styles.bottomDrawerSection}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={24} color="#FF6347" />
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    paddingTop: 0, 
  },
  drawerHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 20,
    backgroundColor: '#FFF', 
    flexDirection: 'row',
  },
  drawerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  drawerHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  drawerItemIcon: {
    marginRight: 15,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  bottomDrawerSection: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutButtonText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#FF6347', 
    fontWeight: 'bold',
  },
});

export default DrawerContent;