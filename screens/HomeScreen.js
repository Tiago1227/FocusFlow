import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useNavigation, useDrawerStatus, useRoute } from '@react-navigation/native';
import QuickAddTask from '../components/QuickAddTask';

const initialTasks = [
    { id: '1', title: 'Finalizar relatório', description: 'Análise...', category: 'Trabalho', time: '10:00', dueDate: '2025-11-02', isCompleted: false, isStarred: false },
    { id: '2', title: 'Fazer compras', description: 'Supermercado...', category: 'Pessoal', time: '14:00', dueDate: '2025-11-02', isCompleted: false, isStarred: true },
    { id: '3', title: 'Agendar dentista', description: 'Consulta...', category: 'Saúde', time: '09:00', dueDate: '2025-11-01', isCompleted: true, isStarred: false },
    { id: '4', title: 'Estudar React Native', description: 'SwipeList...', category: 'Estudo', time: '18:00', dueDate: '2025-11-03', isCompleted: false, isStarred: false },
];

const TaskItem = ({ task, onToggleComplete }) => {
    const getCategoryColor = (category) => {
        switch (category) {
            case 'Trabalho': return '#3CB0E1';
            case 'Pessoal': return '#8C4DD5';
            case 'Estudo': return '#FFD700';
            case 'Saúde': return '#FF6347';
            default: return '#808080';
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            style={styles.taskItemContainer}
            onPress={() => onToggleComplete(task.id)}
        >
            <TouchableOpacity
                style={[styles.taskCheckbox, task.isCompleted && styles.taskCheckboxCompleted]}
                onPress={() => onToggleComplete(task.id)}
            >
                {task.isCompleted && <Feather name="check" size={18} color="#FFF" />}
            </TouchableOpacity>

            <View style={styles.taskContent}>
                <Text
                    style={[
                        styles.taskTitle,
                        task.isCompleted && styles.taskTitleCompleted,
                    ]}
                >
                    {task.title}
                </Text>
                {task.description && (
                    <Text style={styles.taskDescription}>{task.description}</Text>
                )}
            </View>

            <View style={styles.taskMeta}>
                {task.isStarred && <Feather name="star" size={16} color="#FFD700" style={{ marginBottom: 5 }} />}
                <Text style={styles.taskTime}>{task.time}</Text>
                <View style={[styles.taskCategory, { backgroundColor: getCategoryColor(task.category) }]}>
                    <Text style={styles.taskCategoryText}>{task.category}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const HomeScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [tasks, setTasks] = useState(initialTasks);
    const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);

    useEffect(() => {
        if (route.params?.savedTask) {
            const { savedTask, mode } = route.params;

            if (mode === 'create') {
                // Adiciona a nova tarefa à lista
                setTasks(prevTasks => [savedTask, ...prevTasks]);
            } else if (mode === 'edit') {
                // Atualiza a tarefa existente na lista
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === savedTask.id ? savedTask : task
                    )
                );
            }

            navigation.setParams({ savedTask: null, mode: null });
        }
    }, [route.params?.savedTask, navigation]);

    const handleToggleComplete = (id) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );
    };

    const handleQuickSave = (newTask) => {
        setTasks(prevTasks => [newTask, ...prevTasks]);
    };

    const handleStarTask = (id) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === id ? { ...task, isStarred: !task.isStarred } : task
            )
        );
    };

    const handleEditTask = (task) => {
        navigation.navigate('AddEditTask', { taskToEdit: task });
    };

    const handleDeleteTask = (id) => {
        Alert.alert(
            'Excluir Tarefa',
            'Tem certeza que deseja excluir esta tarefa?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => {
                        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
                    },
                },
            ]
        );
    };

    // --- NOVO RENDERIZADOR PARA OS BOTÕES "ESCONDIDOS" ---
    const renderHiddenItem = (data, rowMap) => (
        <View style={styles.rowBack}>
            <TouchableOpacity
                style={[styles.backButton, styles.starButton]}
                onPress={() => handleStarTask(data.item.id)}
            >
                <Feather name={data.item.isStarred ? "star" : "star"} size={24} color={data.item.isStarred ? "#FFD700" : "#FFF"} />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.backButton, styles.editButton]}
                onPress={() => handleEditTask(data.item)}
            >
                <Feather name="edit-2" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.backButton, styles.deleteButton]}
                onPress={() => handleDeleteTask(data.item.id)}
            >
                <Feather name="trash-2" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

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

    // Filtra seções vazias
    const sections = tasksData.filter(section => section.data.length > 0);

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
            <SwipeListView
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TaskItem task={item} onToggleComplete={handleToggleComplete} />
                )}
                renderHiddenItem={renderHiddenItem}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionTitle}>{title}</Text>
                )}
                rightOpenValue={-225}
                stopRightSwipe={-230} 
                stopLeftSwipe={0}
                previewRowKey={'1'} 
                previewOpenValue={-40}
                previewOpenDelay={3000}
                useNativeDriver={false}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => ( // O que mostrar se não houver tarefas
                    <View style={styles.emptyState}>
                        <Feather name="check-circle" size={60} color="#CCC" />
                        <Text style={styles.emptyStateText}>Nenhuma tarefa por aqui!</Text>
                        <Text style={styles.emptyStateTextSmall}>Que tal adicionar uma nova?</Text>
                    </View>
                )}
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
                onSaveTask={handleQuickSave}
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