import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Para o FAB
import { useNavigation } from '@react-navigation/native';

// Importe seus componentes de tarefa e modal
import SwipeableTaskItem from '../components/SwipeableTaskItem'; // Reutilize o componente de tarefa
import QuickAddTask from '../components/QuickAddTask'; // Reutilize o modal de adicionar tarefa

// Assumindo que você tem um contexto de tarefas, ajuste conforme sua implementação
// import { useTaskContext } from '../context/TaskContext'; 

const { width } = Dimensions.get('window');

const CalendarScreen = () => {
    const navigation = useNavigation();
    // const { tasks, toggleComplete, editTask, starTask, deleteTask, addTask } = useTaskContext(); // Exemplo de uso do contexto
    
    // Simulação de tarefas (substitua pelo seu contexto real de tarefas)
    const [tasks, setTasks] = useState([
        { id: '1', title: 'Trabalho DAM', description: 'Revisar documentação', isCompleted: false, category: 'Trabalho', priority: 'Alta', dueDate: new Date('2025-08-17T10:00:00'), time: '10:00', isStarred: true },
        { id: '2', title: 'Fazer compra', description: 'Comprar frutas e legumes', isCompleted: false, category: 'Pessoal', priority: 'Média', dueDate: new Date('2025-08-07T10:00:00'), time: '10:00', isStarred: false },
        { id: '3', title: 'Finalizar relatório', description: 'Seção de conclusão', isCompleted: false, category: 'Trabalho', priority: 'Alta', dueDate: new Date('2025-08-17T10:00:00'), time: '10:00', isStarred: false },
        { id: '4', title: 'Reunião com João', description: 'Projeto X', isCompleted: false, category: 'Trabalho', priority: 'Baixa', dueDate: new Date('2025-08-23T14:00:00'), time: '14:00', isStarred: false },
        { id: '5', title: 'Academia', description: 'Treino de pernas', isCompleted: false, category: 'Pessoal', priority: 'Média', dueDate: new Date('2025-08-23T18:00:00'), time: '18:00', isStarred: false },
    ]);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Dia atual como selecionado por padrão
    const [markedDates, setMarkedDates] = useState({});
    const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);

    // --- Funções de manipulação de tarefas (apenas para simulação) ---
    const handleToggleComplete = (id) => {
        setTasks(prevTasks => prevTasks.map(task =>
            task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        ));
    };
    const handleEditTask = (task) => {
        navigation.navigate('AddEditTask', { task });
    };
    const handleStarTask = (id) => {
        setTasks(prevTasks => prevTasks.map(task =>
            task.id === id ? { ...task, isStarred: !task.isStarred } : task
        ));
    };
    const handleDeleteTask = (id) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    };
    // --- Fim das funções de manipulação de tarefas ---

    // Efeito para processar as tarefas e gerar as datas marcadas
    useEffect(() => {
        const newMarkedDates = {};
        tasks.forEach(task => {
            if (task.dueDate) {
                const dateString = new Date(task.dueDate).toISOString().split('T')[0];
                // Se já houver uma marcação para esta data, mantenha a bolinha
                newMarkedDates[dateString] = {
                    ...(newMarkedDates[dateString] || {}),
                    marked: true,
                    dotColor: '#8C4DD5', // Cor da bolinha para dias com tarefa
                };
            }
        });

        // Adiciona a marcação para a data selecionada
        if (selectedDate) {
            newMarkedDates[selectedDate] = {
                ...(newMarkedDates[selectedDate] || {}), // Mantém marcações existentes
                selected: true,
                selectedColor: '#8C4DD5', // Cor do círculo de seleção
                selectedTextColor: '#FFF', // Cor do texto do dia selecionado
                dotColor: '#FFF', // Cor da bolinha quando o dia está selecionado
            };
        }
        setMarkedDates(newMarkedDates);
    }, [tasks, selectedDate]); // Recalcula quando tarefas ou selectedDate mudam

    // Filtra as tarefas para o dia selecionado
    const tasksForSelectedDate = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDateString = new Date(task.dueDate).toISOString().split('T')[0];
        return taskDateString === selectedDate;
    }).sort((a, b) => (a.time || '').localeCompare(b.time || '')); // Ordena por hora

    const onDayPress = (day) => {
        setSelectedDate(day.dateString);
    };

    // Função para renderizar o cabeçalho personalizado do calendário
    const renderCalendarHeader = (date) => {
        const monthYear = new Date(date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const capitalizedMonthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
        return (
            <View style={styles.calendarHeaderCustom}>
                <TouchableOpacity style={styles.calendarHeaderMonthDropdown}>
                    <Text style={styles.calendarHeaderMonthText}>{capitalizedMonthYear}</Text>
                    <Feather name="chevron-down" size={16} color="#333" />
                </TouchableOpacity>
                <View style={styles.calendarHeaderArrows}>
                    <TouchableOpacity onPress={() => console.log('Previous month')}> {/* Adicione lógica de navegação */}
                        <Feather name="chevron-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log('Next month')}> {/* Adicione lógica de navegação */}
                        <Feather name="chevron-right" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.calendarContainer}>
                <Calendar
                    onDayPress={onDayPress}
                    markedDates={markedDates}
                    current={selectedDate} // Mantém o calendário focado no mês da data selecionada
                    enableSwipeMonths={true}
                    // Desabilita o cabeçalho padrão para usar o nosso customizado
                    hideArrows={true} // Esconde as setas padrão
                    hideExtraDays={true} // Não mostra dias de outros meses
                    disableMonthChange={true} // Desabilita a mudança de mês por toque no header
                    // Customização do cabeçalho
                    renderHeader={(date) => {
                        const monthYear = new Date(date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                        // Capitalize a primeira letra do mês
                        const capitalizedMonthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

                        return (
                            <View style={styles.calendarHeaderCustom}>
                                <TouchableOpacity onPress={() => console.log('Abre seletor de mês/ano')} style={styles.calendarHeaderMonthDropdown}>
                                    <Text style={styles.calendarHeaderMonthText}>{capitalizedMonthYear}</Text>
                                    <Feather name="chevron-down" size={16} color="#333" />
                                </TouchableOpacity>
                                <View style={styles.calendarHeaderArrows}>
                                    <TouchableOpacity onPress={() => { /* Lógica para mês anterior */ }}>
                                        <Feather name="chevron-left" size={24} color="#555" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { /* Lógica para próximo mês */ }}>
                                        <Feather name="chevron-right" size={24} color="#555" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                    theme={{
                        backgroundColor: '#ffffff',
                        calendarBackground: '#ffffff',
                        textSectionTitleColor: '#555', // Cor dos dias da semana (S, M, T...)
                        selectedDayBackgroundColor: '#8C4DD5', // Cor do fundo do dia selecionado
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#8C4DD5', // Cor do número do dia atual
                        dayTextColor: '#333',
                        textDisabledColor: '#ccc', // Cor dos dias desabilitados (de outros meses)
                        dotColor: '#8C4DD5', // Cor da bolinha de tarefa
                        selectedDotColor: '#ffffff', // Cor da bolinha em dia selecionado
                        arrowColor: '#8C4DD5', // Cor das setas de navegação
                        monthTextColor: '#333', // Cor do nome do mês
                        textDayFontWeight: '500',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: 'bold',
                        textDayFontSize: 16,
                        textMonthFontSize: 20,
                        textDayHeaderFontSize: 14,
                        'stylesheet.calendar.header': {
                            week: {
                                marginTop: 15,
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                borderBottomWidth: 1,
                                borderBottomColor: '#F0F0F0',
                                paddingBottom: 10,
                            },
                            dayHeader: {
                                color: '#555',
                                fontWeight: 'bold',
                            }
                        },
                    }}
                    // Customização para esconder os dias de outros meses
                    dayComponent={({ date, state, marking }) => {
                        const isOtherMonth = state === 'disabled'; // 'disabled' para dias de outros meses
                        return (
                            <TouchableOpacity
                                onPress={() => onDayPress(date)}
                                style={[
                                    styles.dayWrapper,
                                    marking?.selected && styles.selectedDayWrapper,
                                ]}
                                disabled={isOtherMonth}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        isOtherMonth && styles.otherMonthDayText,
                                        marking?.selected && styles.selectedDayText,
                                        state === 'today' && styles.todayText,
                                    ]}
                                >
                                    {date.day}
                                </Text>
                                {marking?.marked && <View style={[styles.dot, marking?.dotColor && { backgroundColor: marking.dotColor }]} />}
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Lista de Tarefas para a Data Selecionada */}
            <ScrollView style={styles.taskListScrollView} contentContainerStyle={styles.taskListContentContainer}>
                {tasksForSelectedDate.length > 0 ? (
                    tasksForSelectedDate.map(task => (
                        <SwipeableTaskItem
                            key={task.id}
                            task={task}
                            onToggleComplete={handleToggleComplete}
                            onEdit={handleEditTask}
                            onStar={handleStarTask}
                            onDelete={handleDeleteTask}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Feather name="check-circle" size={50} color="#CCC" />
                        <Text style={styles.emptyStateText}>Nenhuma tarefa para este dia.</Text>
                        <Text style={styles.emptyStateTextSmall}>Adicione uma nova tarefa ou selecione outra data.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Botão Flutuante de Adicionar */}
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

            {/* Modal de Adicionar Tarefa Rápida */}
            <QuickAddTask
                visible={isQuickAddVisible}
                onClose={() => setIsQuickAddVisible(false)}
                onAddTask={(newTask) => {
                    // Lógica para adicionar a nova tarefa (usando seu contexto ou estado)
                    setTasks(prevTasks => [...prevTasks, { ...newTask, id: String(prevTasks.length + 1) }]); // Exemplo
                    setIsQuickAddVisible(false);
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    calendarContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 15,
        borderRadius: 15,
        marginTop: 20,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        overflow: 'hidden', // Importante para garantir que o shadow e border-radius funcionem bem
    },
    // Estilos para o cabeçalho personalizado do calendário
    calendarHeaderCustom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 5,
    },
    calendarHeaderMonthDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    calendarHeaderMonthText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 5,
    },
    calendarHeaderArrows: {
        flexDirection: 'row',
        width: 70, // Espaço fixo para as setas
        justifyContent: 'space-between',
    },
    // Estilos para os dias do calendário (renderização personalizada)
    dayWrapper: {
        width: width / 7 - 10, // Largura para cada dia, ajustando margens
        height: width / 7 - 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 99, // Para o formato circular do dia selecionado
        margin: 5, // Espaçamento entre os dias
    },
    selectedDayWrapper: {
        backgroundColor: '#8C4DD5', // Cor de fundo quando selecionado
    },
    dayText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    otherMonthDayText: {
        color: '#ccc', // Cor para dias de outros meses
    },
    selectedDayText: {
        color: '#FFF', // Cor do texto do dia selecionado
    },
    todayText: {
        color: '#8C4DD5', // Cor do número do dia de hoje
        fontWeight: 'bold',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        position: 'absolute',
        bottom: 5, // Posição da bolinha
    },
    taskListScrollView: {
        flex: 1,
        marginTop: 10,
    },
    taskListContentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 100, // Espaço para o FAB
    },
    emptyState: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        padding: 20,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#777',
        marginTop: 15,
        fontWeight: 'bold',
    },
    emptyStateTextSmall: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        right: 30,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});

export default CalendarScreen;