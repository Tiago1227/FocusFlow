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
import TaskItem from './TaskItem';
const SwipeableTaskItem = ({
    task,
    onToggleComplete,
    onEdit,
    onStar,
    onDelete,
}) => {
    const translateX = useSharedValue(0);
    const ROW_HEIGHT = 80;
    const BUTTON_WIDTH = 75;
    const SWIPE_THRESHOLD = -BUTTON_WIDTH * 2.5;

    const handleToggleCompleteJS = () => onToggleComplete(task.id);
    const handleEditJS = () => onEdit(task);
    const handleStarJS = () => onStar(task.id);
    const handleDeleteJS = () => onDelete(task.id);

    const onGestureEvent = ({ nativeEvent }) => {
        'worklet';
        translateX.value = nativeEvent.translationX;
    };

    const onHandlerStateChange = ({ nativeEvent }) => {
        'worklet';
        if (nativeEvent.oldState === State.ACTIVE) {
            let finalTranslateX = nativeEvent.translationX;

            if (finalTranslateX < SWIPE_THRESHOLD) {
                finalTranslateX = withSpring(-BUTTON_WIDTH * 3);
            } else if (finalTranslateX < -BUTTON_WIDTH * 0.5) {
                finalTranslateX = withSpring(0);
            } else {
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
        translateX.value = withSpring(0);
    };

    return (
        <View style={styles.swipeableContainer}>
            <View style={styles.actionsContainer}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={[styles.backButton, styles.starButton]} onPress={() => {
                    runOnJS(handleStarJS)();
                    runOnJS(closeRow)();
                }}>
                    <Feather name="star" size={24} color={task.isStarred ? "#FFD700" : "#E0E0E0"} />
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

            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-10, 10]}
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
        marginBottom: 10,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 2,
        marginHorizontal: 15, 
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
        width: '100%',
        backgroundColor: '#F7F9FC', 
    },
    backButton: {
        width: 75,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    starButton: {
        backgroundColor: '#3CB0E1',
    },
    editButton: {
        backgroundColor: '#8C4DD5',
    },
    deleteButton: {
        backgroundColor: '#FF6347',
    },
});

export default SwipeableTaskItem;