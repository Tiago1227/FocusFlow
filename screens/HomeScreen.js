import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    SectionList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Importe updateDoc e deleteDoc
import QuickAddTask from '../components/QuickAddTask';
import SwipeableTaskItem from '../components/SwipeableTaskItem';

const HomeScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);

    useEffect(() => {
        console.log("HomeScreen: User UID:", user ? user.uid : "No user logged in");
        if (!user) {
            setTasks([]);
            return;
        }

        const tasksCollection = collection(db, 'tasks');
        const q = query(
            tasksCollection,
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const tasksFromDb = [];
            querySnapshot.forEach((doc) => {
                tasksFromDb.push({ id: doc.id, ...doc.data() });
            });
            console.log("Firestore Snapshot: Tarefas recebidas:", tasksFromDb);
            setTasks(tasksFromDb);
        });

        return () => unsubscribe();

    }, [user]);

    console.log("HomeScreen: Estado atual das tarefas:", tasks);

    // --- FUNÇÕES DE INTERAÇÃO COM O FIRESTORE ---

    const handleToggleComplete = async (id) => {
        if (!user) return;
        try {
            const taskRef = doc(db, 'tasks', id);
            const currentTask = tasks.find(t => t.id === id);
            if (currentTask) {
                await updateDoc(taskRef, {
                    isCompleted: !currentTask.isCompleted,
                });
                // O onSnapshot vai atualizar o estado tasks automaticamente
            }
        } catch (error) {
            console.error("Erro ao alternar conclusão da tarefa:", error);
            Alert.alert("Erro", "Não foi possível atualizar a tarefa.");
        }
    };

    const handleStarTask = async (id) => {
        if (!user) return;
        try {
            const taskRef = doc(db, 'tasks', id);
            const currentTask = tasks.find(t => t.id === id);
            if (currentTask) {
                await updateDoc(taskRef, {
                    isStarred: !currentTask.isStarred,
                });
            }
        } catch (error) {
            console.error("Erro ao marcar/desmarcar tarefa como estrela:", error);
            Alert.alert("Erro", "Não foi possível atualizar a tarefa.");
        }
    };

    const handleEditTask = (task) => {
        navigation.navigate('AddEditTask', { taskToEdit: task });
    };

    const handleDeleteTask = async (id) => {
        if (!user) return;
        Alert.alert(
            'Excluir Tarefa',
            'Tem certeza que deseja excluir esta tarefa?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'tasks', id));
                            // O onSnapshot vai remover a tarefa do estado automaticamente
                        } catch (error) {
                            console.error("Erro ao excluir tarefa:", error);
                            Alert.alert("Erro", "Não foi possível excluir a tarefa.");
                        }
                    },
                },
            ]
        );
    };

    // --- FIM DAS FUNÇÕES DE INTERAÇÃO COM O FIRESTORE ---


    // REMOVA O renderHiddenItem (ele não é mais necessário com SectionList)
    // const renderHiddenItem = (data, rowMap) => ( ... );


    const today = new Date().toISOString().slice(0, 10);

    const tasksData = [
        {
            title: 'Para Hoje',
            data: tasks.filter(t => t.dueDate === today && !t.isCompleted).sort((a, b) => a.time.localeCompare(b.time)),
        },
        {
            title: 'Próximos Dias',
            data: tasks.filter(t => t.dueDate !== today && !t.isCompleted).sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.time.localeCompare(b.time)),
        },
        {
            title: 'Concluídas',
            data: tasks.filter(t => t.isCompleted).sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
        },
    ];

    const sections = tasksData.filter(section => section.data.length > 0);

    console.log("HomeScreen: tasksData completo:", tasksData);
    console.log("HomeScreen: Seções filtradas para renderização:", sections);
    return (
        <View style={styles.fullScreenContainer}>
            <View style={styles.header}>
                {/* LINHA DE CIMA: Título e Ícones */}
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.drawerIcon}>
                        <Feather name="menu" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hoje</Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity onPress={() => Alert.alert('Ação', 'Buscar tarefas')}>
                            <Feather name="search" size={24} color="#555" style={styles.headerIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
                            <Feather name="user" size={24} color="#555" style={styles.headerIcon} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* LINHA DE BAIXO: Data */}
                <Text style={styles.headerSubtitle}>
                    {new Date().toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                    })}
                </Text>
            </View>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    // Agora usamos o novo SwipeableTaskItem
                    <SwipeableTaskItem
                        task={item}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditTask}
                        onStar={handleStarTask}
                        onDelete={handleDeleteTask}
                    />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionTitle}>{title}</Text>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <Feather name="check-circle" size={60} color="#CCC" />
                        <Text style={styles.emptyStateText}>Nenhuma tarefa por aqui!</Text>
                        <Text style={styles.emptyStateTextSmall}>Que tal adicionar uma nova?</Text>
                    </View>
                )}
                contentContainerStyle={styles.listContainer}
            />

            {/* Botão Flutuante (igual) */}
            <TouchableOpacity
                style={styles.fabContainer}
                onPress={() => setIsQuickAddVisible(true)}
            >
                <LinearGradient
                    colors={['#8C4DD5', '#3CB0E1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fabGradient}
                >
                    <Feather name="plus" size={30} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>
            <QuickAddTask
                visible={isQuickAddVisible}
                onClose={() => setIsQuickAddVisible(false)}
            />
        </View>
    );
};

// --- ESTILOS  ---
const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginLeft: 20,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#777',
        marginTop: 5,
    },

    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
        width: '100%',
    },
    drawerIcon: {
        marginRight: 15,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        marginTop: 30,
    },
    taskItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 2,
    },
    taskCheckbox: {
        width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: '#8C4DD5',
        justifyContent: 'center', alignItems: 'center', marginRight: 15,
    },
    taskCheckboxCompleted: { backgroundColor: '#8C4DD5', borderColor: '#8C4DD5' },
    taskContent: { flex: 1 },
    taskTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    taskTitleCompleted: { textDecorationLine: 'line-through', color: '#999' },
    taskDescription: { fontSize: 13, color: '#777', marginTop: 2 },
    taskMeta: { alignItems: 'flex-end', marginLeft: 10 },
    taskTime: { fontSize: 13, color: '#777', marginBottom: 5 },
    taskCategory: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    taskCategoryText: { fontSize: 11, color: '#FFF', fontWeight: 'bold' },
    fabContainer: {
        position: 'absolute',
        bottom: 10,
        right: 25,
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#8C4DD5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    fabGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: {
        flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50,
    },
    emptyStateText: { fontSize: 20, color: '#999', marginTop: 15, fontWeight: 'bold' },
    emptyStateTextSmall: { fontSize: 14, color: '#AAA', marginTop: 5 },

    rowBack: {
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingLeft: 15,
        marginBottom: 10,
        borderRadius: 15,
        overflow: 'hidden',
    },
    backButton: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 75,
    },
    starButton: {
        backgroundColor: '#3CB0E1',
        right: 150,
    },
    editButton: {
        backgroundColor: '#8C4DD5',
        right: 75,
    },
    deleteButton: {
        backgroundColor: '#FF6347',
        right: 0,
    },
});

export default HomeScreen;