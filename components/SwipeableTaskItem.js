// components/SwipeableTaskItem.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import TaskItem from './TaskItem'; // Importe o seu TaskItem existente

const SwipeableTaskItem = ({
    task,
    onToggleComplete,
    onEdit,
    onStar,
    onDelete,
}) => {
    const translateX = useSharedValue(0); // Valor de deslocamento horizontal
    const ROW_HEIGHT = 80; // Altura aproximada do item da tarefa para ocultar/mostrar
    const BUTTON_WIDTH = 75; // Largura de cada botão de ação
    const SWIPE_THRESHOLD = -BUTTON_WIDTH * 2.5; // Limite para "abrir" totalmente

    // Funções para serem chamadas no JS thread a partir do Animated thread
    const handleToggleCompleteJS = () => onToggleComplete(task.id);
    const handleEditJS = () => onEdit(task);
    const handleStarJS = () => onStar(task.id);
    const handleDeleteJS = () => onDelete(task.id);

    const onGestureEvent = ({ nativeEvent }) => {
        // Controla o movimento de arrastar
        'worklet'; // Indica que esta função será executada no Animated thread
        translateX.value = nativeEvent.translationX;
    };

    const onHandlerStateChange = ({ nativeEvent }) => {
        // Lida com o fim do gesto (soltar o item)
        'worklet';
        if (nativeEvent.oldState === State.ACTIVE) {
            let finalTranslateX = nativeEvent.translationX;

            // Se arrastou o suficiente para a esquerda, snap para a posição dos botões
            if (finalTranslateX < SWIPE_THRESHOLD) {
                finalTranslateX = withSpring(-BUTTON_WIDTH * 3); // Mostra 3 botões
            } else if (finalTranslateX < -BUTTON_WIDTH * 0.5) { // Se arrastou um pouco, mas não o suficiente para abrir totalmente, fecha
                finalTranslateX = withSpring(0);
            } else { // Se arrastou para a direita ou apenas um pouco para a esquerda, fecha
                finalTranslateX = withSpring(0);
            }
            translateX.value = finalTranslateX;
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const closeRow = () => {
        translateX.value = withSpring(0); // Fecha a linha
    };

    return (
        <View style={styles.swipeableContainer}>
            {/* Botões de Ação (que ficam por trás) */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={[styles.backButton, styles.starButton]} onPress={() => {
                    runOnJS(handleStarJS)();
                    runOnJS(closeRow)();
                }}>
                    <Feather name="star" size={24} color={task.isStarred ? "#FFD700" : "#E0E0E0"} /> {/* Use sempre "star" */}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.backButton, styles.editButton]} onPress={() => {
                    runOnJS(handleEditJS)();
                    runOnJS(closeRow)();
                }}>
                    <Feather name="edit-2" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.backButton, styles.deleteButton]} onPress={() => {
                    runOnJS(handleDeleteJS)();
                    runOnJS(closeRow)();
                }}>
                    <Feather name="trash-2" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Conteúdo da Tarefa (que arrasta) */}
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-10, 10]} // Ativa o gesto apenas se mover horizontalmente
            >
                <Animated.View style={[styles.animatedTaskWrapper, animatedStyle]}>
                    <TaskItem task={task} onToggleComplete={handleToggleCompleteJS} />
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
};

const styles = StyleSheet.create({
    swipeableContainer: {
        marginBottom: 10, // Espaçamento entre os itens
        borderRadius: 15,
        overflow: 'hidden', // Importante para os botões não vazarem
        backgroundColor: '#FFF', // Fundo para os botões aparecerem
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 2,
    },
    animatedTaskWrapper: {
        backgroundColor: '#FFF', 
        width: '100%',
    },
    actionsContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%', // Ocupa toda a largura
        backgroundColor: '#F7F9FC', // Cor de fundo que revela os botões
    },
    backButton: {
        width: 75,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    starButton: {
        backgroundColor: '#3CB0E1', // Azul
    },
    editButton: {
        backgroundColor: '#8C4DD5', // Roxo
    },
    deleteButton: {
        backgroundColor: '#FF6347', // Vermelho/Laranja
    },
});

export default SwipeableTaskItem;