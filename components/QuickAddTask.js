import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebaseConfig'; 
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'; 
import { useAuth } from '../context/AuthContext'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; 
import * as Notifications from 'expo-notifications'; 

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const QuickAddTask = ({ visible, onClose, onSaveTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const inputRef = useRef(null);
  const { currentUser } = useAuth(); 
  const [category, setCategory] = useState('Pessoal'); 
  const [date, setDate] = useState(new Date()); 
  const [priority, setPriority] = useState('Média'); 
  const [reminderTime, setReminderTime] = useState(null); 

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false); 
  const [currentPriorityIndex, setCurrentPriorityIndex] = useState(1); 

  const priorities = [
    { label: 'Baixa', value: 'Baixa', color: '#2ECC71' }, // Verde
    { label: 'Média', value: 'Média', color: '#F1C40F' }, // Amarelo
    { label: 'Alta', value: 'Alta', color: '#E74C3C' },   // Vermelho
  ];

  useEffect(() => {
    setPriority(priorities[currentPriorityIndex].value);
  }, [currentPriorityIndex]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const togglePriority = () => {
    setCurrentPriorityIndex((prevIndex) => (prevIndex + 1) % priorities.length);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    if (Platform.OS === 'android') { 
      setShowDatePicker(false);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(Platform.OS === 'ios'); 
    setDate(currentTime);
    if (Platform.OS === 'android') { 
      setShowTimePicker(false);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
    setShowTimePicker(false); 
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
    setShowDatePicker(false); 
  };

  const handleSave = async () => {
    if (!title || !currentUser) {
      Alert.alert('Erro', 'O título é obrigatório e você deve estar logado.');
      return;
    }

    try {
      const taskData = {
        userId: currentUser.uid,
        title: title,
        description: description,
        category: category,
        priority: priorities[currentPriorityIndex].value, 
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        dueDate: Timestamp.fromDate(date),
        isCompleted: false,
        isStarred: false,
        createdAt: serverTimestamp(),
        reminderTime: reminderTime,
      };

      await addDoc(collection(db, 'tasks'), taskData);

      // --- Lógica de Notificação ---
      if (reminderTime && date) {
        await registerForPushNotificationsAsync(); 

        const triggerDate = new Date(date);
        triggerDate.setMinutes(triggerDate.getMinutes() - reminderTime); 

        if (triggerDate > new Date()) { 
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Lembrete de Tarefa: " + title,
              body: `Sua tarefa "${title}" está programada para ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} em ${date.toLocaleDateString('pt-BR')}.`,
              data: { taskId: taskData.id },
            },
            trigger: triggerDate,
          });
          console.log(`Lembrete agendado para ${reminderTime} minutos antes.`);
        } else {
          console.log("Data de lembrete no passado, não agendado.");
        }
      }

      resetAndClose();

    } catch (error) {
      console.error("Erro ao adicionar tarefa: ", error);
      Alert.alert('Erro', 'Não foi possível salvar sua tarefa.');
    }
  };

  async function registerForPushNotificationsAsync() {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Permissão de Notificação', 'Você não concedeu permissão para notificações. Lembretes não serão enviados.');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
    return token;
  }

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setCategory('Pessoal'); 
    setDate(new Date()); 
    setPriority('Média'); 
    setReminderTime(null); 
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => {
          resetAndClose();
          setShowCategoryDropdown(false);
        }} />

        <View style={styles.content}>
          <TextInput
            ref={inputRef}
            style={styles.inputTitle}
            placeholder="Insira uma nova tarefa aqui ..."
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.newActionsRow}>
            {/* Categoria */}
            <View style={styles.categoryButtonWrapper}>
              <TouchableOpacity
                style={[styles.actionChip, { backgroundColor: '#E0E0E0' }]}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={styles.actionChipText}>{category}</Text>
                <Feather name="chevron-down" size={16} color="#333" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
              {showCategoryDropdown && (
                <View style={styles.categoryDropdown}>
                  {['Pessoal', 'Trabalho', 'Estudo', 'Saúde'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Data e Hora */}
            <TouchableOpacity style={styles.actionChip} onPress={() => showDatepicker()}>
                <Feather name="calendar" size={16} color="#333" />
                <Text style={styles.actionChipText}>
                    {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    {' - '}
                    {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </TouchableOpacity>

            {/* Prioridade */}
            <TouchableOpacity
              style={[styles.priorityChip, { backgroundColor: priorities[currentPriorityIndex].color }]}
              onPress={togglePriority}
            >
              <Feather name="alert-circle" size={16} color="#FFF" />
            </TouchableOpacity>

            {/* Lembrete */}
            <TouchableOpacity style={styles.actionChip} onPress={() => setShowReminderPicker(true)}>
                <Feather name="bell" size={16} color="#333" />
                {reminderTime && <Text style={styles.actionChipTextSmall}>{reminderTime} min antes</Text>}
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.inputDescription}
            placeholder="Adicionar descrição ..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Feather name="check" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          testID="datePickerAndroid"
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            onDateChange(event, selectedDate);
            if (event.type === 'set') { 
              setShowTimePicker(true);
            }
          }}
        />
      )}

      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          testID="timePickerAndroid"
          value={date}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}

      {(showDatePicker || showTimePicker) && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDatePicker || showTimePicker}
          onRequestClose={() => { setShowDatePicker(false); setShowTimePicker(false); }}
        >
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => { setShowDatePicker(false); setShowTimePicker(false); }}
          >
            <View style={styles.dateTimePickerWrapper}>
              <DateTimePicker
                testID="dateTimePickerIOS"
                value={date}
                mode={showDatePicker ? 'date' : 'time'}
                is24Hour={true}
                display="spinner"
                onChange={showDatePicker ? onDateChange : onTimeChange}
                style={styles.dateTimePickerStyle}
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  if (showDatePicker) { 
                    setShowDatePicker(false);
                    setShowTimePicker(true);
                  } else { 
                    setShowTimePicker(false);
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>{showDatePicker ? 'Próximo (Hora)' : 'Confirmar'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <Modal
        transparent={true}
        animationType="fade"
        visible={showReminderPicker}
        onRequestClose={() => setShowReminderPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowReminderPicker(false)}
        >
          <View style={styles.pickerModalContainer}>
            <Picker
              selectedValue={reminderTime}
              onValueChange={(itemValue) => {
                setReminderTime(itemValue);
                setShowReminderPicker(false);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Sem Lembrete" value={null} />
              <Picker.Item label="5 minutos antes" value={5} />
              <Picker.Item label="15 minutos antes" value={15} />
              <Picker.Item label="30 minutos antes" value={30} />
              <Picker.Item label="1 hora antes" value={60} />
              <Picker.Item label="1 dia antes" value={1440} />
            </Picker>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setShowReminderPicker(false)}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 20,
    paddingBottom: 15,
    maxHeight: '85%',
    flexGrow: 0, 
  },
  inputTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  inputDescription: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: '#333',
    minHeight: 60,
    textAlignVertical: 'top',
    marginTop: 15,
    marginBottom: 10,
  },

  newActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap', 
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8, 
    marginBottom: 8, 
  },
  actionChipText: {
    marginLeft: 5,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  actionChipTextSmall: { 
    marginLeft: 5,
    fontSize: 11,
    color: '#555',
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#8C4DD5',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto', 
    marginBottom: 8,
  },

  categoryButtonWrapper: {
    position: 'relative',
    zIndex: 10, 
    marginRight: 8,
    marginBottom: 8,
  },
  categoryDropdown: {
    position: 'absolute',
    top: '100%', 
    left: 0,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 100, 
    minWidth: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },

  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  pickerModalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    width: '80%',
    maxWidth: 350,
  },
  picker: {
    width: '100%',
  },
  dateTimePickerWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    width: '80%',
    maxWidth: 350,
    alignItems: 'center',
  },
  dateTimePickerStyle: {
    width: '100%',
  },
  confirmButton: {
    marginTop: 15,
    backgroundColor: '#8C4DD5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default QuickAddTask;