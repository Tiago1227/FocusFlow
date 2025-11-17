import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    SectionList,
    Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, DrawerActions } from '@react-navigation/native';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import QuickAddTask from '../components/QuickAddTask';
import SwipeableTaskItem from '../components/SwipeableTaskItem';

const HomeScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { currentUser } = useAuth();

    const [tasks, setTasks] = useState([]);
    const [sections, setSections] = useState([]);
    const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState({ type: 'all', value: null });
    const [sortBy, setSortBy] = useState('dueDate');
    const [sortOrder, setSortOrder] = useState('asc');

    const groupTasksByDate = (tasksToGroup) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextSevenDays = new Date();
        nextSevenDays.setDate(today.getDate() + 7);
        nextSevenDays.setHours(23, 59, 59, 999);

        const activeTasks = tasksToGroup.filter(task => !task.isCompleted);
        const completedTasks = tasksToGroup.filter(task => task.isCompleted);

        const groupedActive = {
            'Para Hoje': [],
            'Próximos 7 Dias': [],
            'Outras Datas': [],
        };

        activeTasks.forEach(task => {
            const taskDueDate = task.dueDate;
            if (!taskDueDate || isNaN(taskDueDate.getTime())) {
                groupedActive['Outras Datas'].push(task);
                return;
            }
            taskDueDate.setHours(0, 0, 0, 0);

            if (taskDueDate.getTime() === today.getTime()) {
                groupedActive['Para Hoje'].push(task);
            } else if (taskDueDate > today && taskDueDate <= nextSevenDays) {
                groupedActive['Próximos 7 Dias'].push(task);
            } else {
                groupedActive['Outras Datas'].push(task);
            }
        });

        Object.keys(groupedActive).forEach(key => {
            groupedActive[key].sort((a, b) => {
                const dateA = a.dueDate ? new Date(a.dueDate.getFullYear(), a.dueDate.getMonth(), a.dueDate.getDate(), (a.time ? parseInt(a.time.split(':')[0]) : 0), (a.time ? parseInt(a.time.split(':')[1]) : 0)) : new Date(0);
                const dateB = b.dueDate ? new Date(b.dueDate.getFullYear(), b.dueDate.getMonth(), b.dueDate.getDate(), (b.time ? parseInt(b.time.split(':')[0]) : 0), (b.time ? parseInt(b.time.split(':')[1]) : 0)) : new Date(0);

                return dateA.getTime() - dateB.getTime();
            });
        });

        const finalSections = [];

        if (groupedActive['Para Hoje'].length > 0) {
            finalSections.push({ title: 'Para Hoje', data: groupedActive['Para Hoje'] });
        }
        if (groupedActive['Próximos 7 Dias'].length > 0) {
            finalSections.push({ title: 'Próximos 7 Dias', data: groupedActive['Próximos 7 Dias'] });
        }
        if (groupedActive['Outras Datas'].length > 0) {
            finalSections.push({ title: 'Outras Datas', data: groupedActive['Outras Datas'] });
        }
        if (completedTasks.length > 0) {
            finalSections.push({ title: 'Concluídas', data: completedTasks });
        }

        return finalSections;
    };

    useEffect(() => {
        if (route.params?.filterType) {
            setActiveFilter({
                type: route.params.filterType,
                value: route.params.filterValue || null
            });
            navigation.setParams({ filterType: undefined, filterValue: undefined });
        }
    }, [route.params?.filterType, route.params?.filterValue]);

    useEffect(() => {
        if (!currentUser) return;

        const tasksCollectionRef = collection(db, 'tasks');
        let q = query(tasksCollectionRef, where('userId', '==', currentUser.uid));

        if (activeFilter.type === 'category' && activeFilter.value) {
            q = query(q, where('category', '==', activeFilter.value));
        } else if (activeFilter.type === 'priority' && activeFilter.value) {
            q = query(q, where('priority', '==', activeFilter.value));
        } else if (activeFilter.type === 'starred') {
            q = query(q, where('isStarred', '==', true));
        }

        q = query(q, orderBy('dueDate', 'asc'), orderBy('time', 'asc'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                dueDate: doc.data().dueDate
                    ? (doc.data().dueDate.toDate
                        ? doc.data().dueDate.toDate()
                        : new Date(doc.data().dueDate + 'T00:00:00'))
                    : null,
            }));
            setTasks(fetchedTasks);

            const newSections = groupTasksByDate(fetchedTasks);
            setSections(newSections);
        }, (error) => {
            console.error("Erro ao buscar tarefas:", error);
            Alert.alert("Erro", "Não foi possível carregar as tarefas.");
        });

        return () => unsubscribe();
    }, [currentUser, activeFilter.type, activeFilter.value]);

    const handleToggleComplete = async (id) => {
        if (!currentUser) return;
        try {
            const taskRef = doc(db, 'tasks', id);
            const currentTask = tasks.find(t => t.id === id);
            if (currentTask) {
                await updateDoc(taskRef, {
                    isCompleted: !currentTask.isCompleted,
                });
            }
        } catch (error) {
            console.error("Erro ao alternar conclusão da tarefa:", error);
            Alert.alert("Erro", "Não foi possível atualizar a tarefa.");
        }
    };

    const handleStarTask = async (id) => {
        if (!currentUser) return;
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
        if (!currentUser) return;
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
                        } catch (error) {
                            console.error("Erro ao excluir tarefa:", error);
                            Alert.alert("Erro", "Não foi possível excluir a tarefa.");
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.fullScreenContainer}>
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.drawerIcon}>
                        <Feather name="menu" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {String(
                            activeFilter.type === 'all' ? 'Hoje' :
                                activeFilter.type === 'starred' ? 'Estreladas' :
                                    activeFilter.value || 'Tarefas'
                        )}
                    </Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                            <Feather name="user" size={24} color="#555" style={styles.headerIcon} />
                        </TouchableOpacity>
                    </View>
                </View>

                {activeFilter.type === 'all' && (
                    <Text style={styles.headerSubtitle}>
                        {new Date().toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </Text>
                )}
            </View>
            <SectionList
                sections={sections}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <SwipeableTaskItem
                        task={item}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditTask}
                        onStar={handleStarTask}
                        onDelete={handleDeleteTask}
                    />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.sectionHeaderContainer}>
                        <Text style={styles.sectionTitle}>{title}</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <Feather name="check-circle" size={60} color="#CCC" />
                        <Text style={styles.emptyStateText}>Nenhuma tarefa por aqui!</Text>
                        <Text style={styles.emptyStateTextSmall}>Que tal adicionar uma nova?</Text>
                    </View>
                )}
                contentContainerStyle={styles.listContentContainer}
                stickySectionHeadersEnabled={true}
            />

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

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 60,
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
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
        width: '100%',
    },
    drawerIcon: {
        marginRight: 15,
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
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
        padding: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#777',
        marginTop: 5,
    },
    sectionHeaderContainer: {
        backgroundColor: '#F7F9FC',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    listContentContainer: {
        paddingBottom: 100,
    },
    emptyState: {
        flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50,
    },
    emptyStateText: { fontSize: 20, color: '#999', marginTop: 15, fontWeight: 'bold' },
    emptyStateTextSmall: { fontSize: 14, color: '#AAA', marginTop: 5 },

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
});

export default HomeScreen;