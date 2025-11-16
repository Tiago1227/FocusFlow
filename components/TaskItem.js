import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

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

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Baixa': return '#2ECC71';  // Verde
            case 'Média': return '#F1C40F';  // Amarelo
            case 'Alta': return '#E74C3C';   // Vermelho
            default: return '#808080';
        }
    };

    const formattedDueDate = task.dueDate && !isNaN(task.dueDate.getTime())
        ? task.dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        : '';

    return (
        <View 
            style={[
                styles.taskItemContainer,
                task.isCompleted && styles.taskItemCompleted,
            ]}
        >
            {/* Checkbox */}
            <TouchableOpacity
                style={[styles.taskCheckbox, task.isCompleted && styles.taskCheckboxCompleted]}
                onPress={() => onToggleComplete(task.id)}
            >
                {task.isCompleted && <Feather name="check" size={18} color="#FFF" />}
            </TouchableOpacity>

            {/* Conteúdo da Tarefa */}
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
                    <Text
                        style={[
                            styles.taskDescription,
                            task.isCompleted && styles.taskTitleCompleted, 
                        ]}
                        numberOfLines={1} 
                    >
                        {task.description}
                    </Text>
                )}

                {/* Linha para Categoria e Prioridade */}
                <View style={styles.taskMetaRow}>
                    {/* Categoria */}
                    {task.category && (
                        <View style={[styles.taskCategory, { backgroundColor: getCategoryColor(task.category) }]}>
                            <Text style={styles.taskCategoryText}>{task.category}</Text>
                        </View>
                    )}
                    {/* Prioridade */}
                    {task.priority && (
                        <View style={[styles.taskPriority, { backgroundColor: getPriorityColor(task.priority) }]}>
                            <Feather name="alert-circle" size={12} color="#FFF" />
                            <Text style={styles.taskPriorityText}>{task.priority}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Data, Hora e Estrela */}
            <View style={styles.taskDateTimeContainer}>
                {task.isStarred && !task.isCompleted && ( 
                    <Feather name="star" size={16} color="#FFD700" style={styles.starredIcon} />
                )}
                {formattedDueDate !== '' && <Text style={styles.taskDate}>{formattedDueDate}</Text>}
                {task.time && <Text style={styles.taskTime}>{task.time}</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    taskItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
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
    taskMetaRow: { 
        flexDirection: 'row',
        marginTop: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    taskCategory: {
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
        marginRight: 8, marginBottom: 4, 
    },
    taskCategoryText: { fontSize: 11, color: '#FFF', fontWeight: 'bold' },
    taskPriority: { 
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginRight: 8,
        marginBottom: 4,
    },
    taskPriorityText: {
        fontSize: 11,
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 4, 
    },
    taskDateTimeContainer: { 
        alignItems: 'flex-end',
        marginLeft: 10,
    },
    taskDate: { fontSize: 12, color: '#555', marginBottom: 2 },
    taskTime: { fontSize: 11, color: '#777' },
    starredIcon: { marginBottom: 5 },
});

export default TaskItem;