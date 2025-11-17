import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation, DrawerActions } from '@react-navigation/native'; 
import FocusFlowLogo from '../assets/images/logotext.png';

const DrawerContent = (props) => {
    const { logout } = useAuth();
    const navigation = useNavigation();

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

    const applyFilter = (type, value = null) => {
        navigation.navigate('MainAppContent', { 
            screen: 'TarefasTab',            
            params: {                        
                screen: 'Home',              
                params: {                    
                    filterType: type,
                    filterValue: value
                }
            }
        });

        navigation.dispatch(DrawerActions.closeDrawer());
    };

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
                {/* Cabeçalho do Drawer */}
                <View style={styles.drawerHeader}>
                    <Image source={FocusFlowLogo} style={styles.drawerLogo} resizeMode="contain" />
                    <Text style={styles.drawerHeaderText}>Focus Flow</Text>
                </View>

                {/* Itens do Drawer (filtros de Categoria) */}
                <Text style={styles.sectionTitle}>Categoria</Text>
                <TouchableOpacity style={styles.drawerItem} onPress={() => applyFilter('all')}> 
                    <Feather name="folder" size={20} color="#555" style={styles.drawerItemIcon} />
                    <Text style={styles.drawerItemText}>Todos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => applyFilter('category', 'Trabalho')}> 
                    <Feather name="briefcase" size={20} color="#555" style={styles.drawerItemIcon} />
                    <Text style={styles.drawerItemText}>Trabalho</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => applyFilter('category', 'Pessoal')}> 
                    <Feather name="home" size={20} color="#555" style={styles.drawerItemIcon} />
                    <Text style={styles.drawerItemText}>Pessoal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => applyFilter('category', 'Estudo')}> 
                    <Feather name="book-open" size={20} color="#555" style={styles.drawerItemIcon} />
                    <Text style={styles.drawerItemText}>Estudo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => applyFilter('category', 'Saúde')}>
                    <Feather name="heart" size={20} color="#555" style={styles.drawerItemIcon} />
                    <Text style={styles.drawerItemText}>Saúde</Text>
                </TouchableOpacity>
                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Outros Filtros</Text>
                <TouchableOpacity style={styles.drawerItem} onPress={() => applyFilter('starred')}> 
                    <Feather name="star" size={20} color="#FFD700" style={styles.drawerItemIcon} />
                    <Text style={styles.drawerItemText}>Tarefas estrela</Text>
                </TouchableOpacity>

                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Prioridade</Text>
                <TouchableOpacity style={styles.drawerItem} onPress={() => applyFilter('priority', 'Alta')}>
                    <Feather name="alert-circle" size={20} color="#E74C3C" style={styles.drawerItemIcon} />
                    <Text style={styles.drawerItemText}>Alta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => applyFilter('priority', 'Média')}>
                    <Feather name="alert-triangle" size={20} color="#F1C40F" style={styles.drawerItemIcon} />
                    <Text style={styles.drawerItemText}>Média</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => applyFilter('priority', 'Baixa')}>
                    <Feather name="check-circle" size={20} color="#2ECC71" style={styles.drawerItemIcon} />
                    <Text style={styles.drawerItemText}>Baixa</Text>
                </TouchableOpacity>
            </DrawerContentScrollView>

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