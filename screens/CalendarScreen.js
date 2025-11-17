import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import QuickAddTask from '../components/QuickAddTask'; 
import TaskItem from '../components/TaskItem'; 

LocaleConfig.locales['pt-br'] = {
    monthNames: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
    today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const CalendarScreen = () => {
    const navigation = useNavigation();
    const { currentUser } = useAuth();

    const [selectedDate, setSelectedDate] = useState(null);
    const [tasks, setTasks] = useState([]); 
    const [tasksForSelectedDay, setTasksForSelectedDay] = useState([]);
    const [markedDates, setMarkedDates] = useState({});
    const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isTasksLoaded, setIsTasksLoaded] = useState(false); 

    const getFormattedDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (!currentUser) {
            console.log("LOG CalendarScreen DEBUG: Usuário não logado, não carregando tarefas.");
            setTasks([]);
            setTasksForSelectedDay([]);
            setMarkedDates({});
            setIsTasksLoaded(false);
            return;
        }

        const tasksCollectionRef = collection(db, 'tasks');
        const q = query(
            tasksCollectionRef,
            where('userId', '==', currentUser.uid),
            orderBy('dueDate', 'asc'), 
            orderBy('time', 'asc')    
        );

        console.log("LOG CalendarScreen DEBUG: Iniciando onSnapshot para o usuário:", currentUser.uid);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("LOG CalendarScreen DEBUG: Snapshot recebido. Docs:", snapshot.docs.length);
            const fetchedTasks = snapshot.docs.map(doc => {
                const data = doc.data();
                const taskDueDate = data.dueDate
                    ? (data.dueDate.toDate
                        ? data.dueDate.toDate()
                        : (typeof data.dueDate === 'string' && data.dueDate.match(/^\d{4}-\d{2}-\d{2}$/) 
                            ? new Date(data.dueDate + 'T00:00:00') 
                            : null))
                    : null; 

                if (taskDueDate && isNaN(taskDueDate.getTime())) {
                    console.warn(`LOG CalendarScreen WARNING: dueDate inválido para tarefa ${doc.id}:`, data.dueDate);
                    return { id: doc.id, ...data, dueDate: null };
                }

                return {
                    id: doc.id,
                    ...data,
                    dueDate: taskDueDate,
                };
            });
            console.log("LOG CalendarScreen DEBUG: Tarefas formatadas:", fetchedTasks);
            setTasks(fetchedTasks);
            setIsTasksLoaded(true); 
        }, (error) => {
            console.error("LOG CalendarScreen ERROR: Erro ao buscar tarefas no CalendarScreen:", error);
            Alert.alert("Erro", "Não foi possível carregar as tarefas no calendário.");
            setIsTasksLoaded(true); 
        });

        return () => {
            unsubscribe();
            console.log("LOG CalendarScreen DEBUG: onSnapshot unsubscribed.");
        };
    }, [currentUser]);

    useEffect(() => {
        if (isTasksLoaded && !selectedDate) {
            console.log("LOG CalendarScreen DEBUG: Tarefas carregadas, definindo selectedDate para hoje.");
            setSelectedDate(new Date());
        }
    }, [isTasksLoaded, selectedDate]);


    useEffect(() => {
        if (!selectedDate) {
            console.log("LOG CalendarScreen DEBUG: selectedDate ainda não definido, pulando atualização de markedDates.");
            return;
        }

        const newMarkedDates = {};
        const tempTasksForSelectedDay = [];
        const selectedDateString = getFormattedDate(selectedDate);
        console.log("LOG CalendarScreen DEBUG: Data selecionada:", selectedDateString);

        tasks.forEach(task => {
            if (task.dueDate) {
                const taskDateString = getFormattedDate(task.dueDate);

                if (!newMarkedDates[taskDateString]) {
                    newMarkedDates[taskDateString] = { dots: [], selected: false, selectedColor: 'purple' };
                }
                if (!task.isCompleted) {
                    newMarkedDates[taskDateString].dots.push({ color: '#8C4DD5', selectedDotColor: 'white' });
                } else {
                    newMarkedDates[taskDateString].dots.push({ color: '#ccc', selectedDotColor: 'white' });
                }
               
                if (taskDateString === selectedDateString) {
                    tempTasksForSelectedDay.push(task);
                }
            }
        });

        newMarkedDates[selectedDateString] = {
            ...(newMarkedDates[selectedDateString] || {}), 
            selected: true,
            selectedColor: '#8C4DD5',
            selectedTextColor: '#FFF',
            dotColor: 'white',
        };

        tempTasksForSelectedDay.sort((a, b) => {
            const timeA = a.time ? parseInt(a.time.replace(':', '')) : 9999; 
            const timeB = b.time ? parseInt(b.time.replace(':', '')) : 9999;
            return timeA - timeB;
        });

        setMarkedDates(newMarkedDates);
        setTasksForSelectedDay(tempTasksForSelectedDay);
        console.log(`LOG CalendarScreen DEBUG: Total de tarefas para o dia selecionado (${selectedDateString}):`, tempTasksForSelectedDay.length);

    }, [tasks, selectedDate]);

    const handleDayPress = (day) => {
        console.log("LOG CalendarScreen DEBUG: Dia pressionado:", day.dateString);
        setSelectedDate(new Date(day.year, day.month - 1, day.day));
    };

    const handleToggleComplete = async (id) => {
        if (!currentUser) return;
        try {
            const taskRef = doc(db, 'tasks', id);
            const currentTask = tasks.find(t => t.id === id);
            if (currentTask) {
                await updateDoc(taskRef, {
                    isCompleted: !currentTask.isCompleted,
                });
                console.log(`LOG CalendarScreen DEBUG: Tarefa ${id} marcada como concluída: ${!currentTask.isCompleted}`);
            }
        } catch (error) {
            console.error("LOG CalendarScreen ERROR: Erro ao alternar conclusão da tarefa:", error);
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
                console.log(`LOG CalendarScreen DEBUG: Tarefa ${id} marcada como estrela: ${!currentTask.isStarred}`);
            }
        } catch (error) {
            console.error("LOG CalendarScreen ERROR: Erro ao marcar/desmarcar tarefa como estrela:", error);
            Alert.alert("Erro", "Não foi possível atualizar a tarefa.");
        }
    };

    const handleEditTask = (task) => {
        console.log("LOG CalendarScreen DEBUG: Editando tarefa:", task.id);
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
                            console.log(`LOG CalendarScreen DEBUG: Tarefa ${id} excluída.`);
                        } catch (error) {
                            console.error("LOG CalendarScreen ERROR: Erro ao excluir tarefa:", error);
                            Alert.alert("Erro", "Não foi possível excluir a tarefa.");
                        }
                    },
                },
            ]
        );
    };

    const handleQuickAddTask = (task) => {
        console.log("LOG CalendarScreen DEBUG: QuickAddTask salvou uma tarefa.");
        setIsQuickAddVisible(false);
        setRefreshing(true);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            console.log("LOG CalendarScreen DEBUG: Refresh manual concluído.");
        }, 1000);
    }, []);

    const handleMonthChange = (month) => {
        console.log("LOG CalendarScreen DEBUG: Mês alterado para:", month.dateString);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Calendário</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.searchButton}>
                    <Feather name="search" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.contentArea}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {selectedDate && (
                    <Calendar
                        onDayPress={handleDayPress}
                        markedDates={markedDates}
                        markingType={'dots'}
                        enableSwipeMonths={true}
                        onMonthChange={handleMonthChange}
                        current={getFormattedDate(selectedDate)} 
                        theme={{
                            calendarBackground: '#FFFFFF',
                            textSectionTitleColor: '#b6c1cd',
                            selectedDayBackgroundColor: '#8C4DD5',
                            selectedDayTextColor: '#FFFFFF',
                            todayTextColor: '#8C4DD5',
                            dayTextColor: '#2d4150',
                            textDisabledColor: '#d9e1e8',
                            dotColor: '#8C4DD5',
                            selectedDotColor: '#ffffff',
                            arrowColor: '#8C4DD5',
                            monthTextColor: '#2d4150',
                            textDayFontFamily: 'System',
                            textMonthFontFamily: 'System',
                            textDayHeaderFontFamily: 'System',
                            textDayFontWeight: '300',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '300',
                            textDayFontSize: 16,
                            textMonthFontSize: 18,
                            textDayHeaderFontSize: 13,
                        }}
                    />
                )}
                {!selectedDate && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#8C4DD5" />
                        <Text style={styles.loadingText}>Carregando calendário...</Text>
                    </View>
                )}


                <View style={styles.tasksContainer}>
                    {selectedDate && ( 
                        <Text style={styles.tasksHeader}>Tarefas para {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                    )}
                    {tasksForSelectedDay.length > 0 ? (
                        <FlatList
                            data={tasksForSelectedDay}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.taskItemWrapper}>
                                    <TaskItem
                                        task={item}
                                        onToggleComplete={handleToggleComplete}
                                        onEdit={handleEditTask}
                                        onStar={handleStarTask}
                                        onDelete={handleDeleteTask}
                                    />
                                </View>
                            )}
                            scrollEnabled={false}
                        />
                    ) : (
                        selectedDate && (
                            <View style={styles.emptyState}>
                                <Feather name="inbox" size={50} color="#CCC" />
                                <Text style={styles.emptyStateText}>Nenhuma tarefa para este dia.</Text>
                            </View>
                        )
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fabContainer}
                onPress={() => setIsQuickAddVisible(true)}
            >
                <View style={styles.fabGradient}>
                    <Feather name="plus" size={30} color="#FFF" />
                </View>
            </TouchableOpacity>

            {/* Modal de QuickAddTask */}
            <QuickAddTask
                visible={isQuickAddVisible}
                onClose={() => setIsQuickAddVisible(false)}
                onSaveTask={handleQuickAddTask}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    searchButton: {
        padding: 5,
    },
    contentArea: {
        flex: 1,
        paddingBottom: 70, 
    },
    tasksContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    tasksHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    taskItemWrapper: {
        marginBottom: 10,
        borderRadius: 15,
        overflow: 'hidden', 
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
    },
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
    fabGradient: { 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8C4DD5', 
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
        minHeight: 200, 
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
});

export default CalendarScreen;