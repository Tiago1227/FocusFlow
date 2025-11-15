// components/TaskItem.js
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

// --- ESTILOS para TaskItem ---
const styles = StyleSheet.create({
    taskItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF', // Deve ser branco para o swipeable cobrir
        borderRadius: 15,
        padding: 15,
        // marginBottom: 10, // Removido daqui, gerenciado pelo SwipeableTaskItem
        // shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation // Removido daqui, gerenciado pelo SwipeableTaskItem
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
});

export default TaskItem;