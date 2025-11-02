import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { v4 as uuidv4 } from 'uuid'; 


const AddEditTaskScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const taskToEdit = route.params?.taskToEdit; 
  const isEditMode = !!taskToEdit; 

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState('Pessoal'); 

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); 

  useEffect(() => {
    if (isEditMode) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setDate(new Date(taskToEdit.dueDate)); 
      setCategory(taskToEdit.category);
    }
  }, [isEditMode, taskToEdit]);

  const showMode = (modeToShow) => {
    setShowPicker(true);
    setPickerMode(modeToShow);
  };

  const onDateTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios'); 
    setDate(currentDate);
  };

  const handleSaveTask = () => {
    if (!title) {
      Alert.alert('Erro', 'O título da tarefa é obrigatório.');
      return;
    }

    // Cria o objeto da tarefa
    const taskData = {
      id: isEditMode ? taskToEdit.id : uuidv4(), 
      title,
      description,
      category,
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dueDate: date.toISOString().slice(0, 10), 
      isCompleted: isEditMode ? taskToEdit.isCompleted : false,
      isStarred: isEditMode ? taskToEdit.isStarred : false,
    };

    navigation.navigate('Home', { 
      savedTask: taskData, 
      mode: isEditMode ? 'edit' : 'create' 
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.fullScreenContainer}
    >
      {/* Cabeçalho Customizado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Feather name="x" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>
        <TouchableOpacity onPress={handleSaveTask} style={styles.headerButton}>
          <Feather name="check" size={24} color="#8C4DD5" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Título */}
        <TextInput
          style={styles.inputTitle}
          placeholder="Qual a sua tarefa?"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />

        {/* Descrição */}
        <TextInput
          style={styles.inputDescription}
          placeholder="Adicionar descrição..."
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Seletor de Data */}
        <Text style={styles.label}>Data</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => showMode('date')}>
          <Feather name="calendar" size={20} color="#555" />
          <Text style={styles.pickerText}>
            {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </Text>
        </TouchableOpacity>

        {/* Seletor de Hora */}
        <Text style={styles.label}>Hora</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => showMode('time')}>
          <Feather name="clock" size={20} color="#555" />
          <Text style={styles.pickerText}>
            {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        {/* Seletor de Categoria */}
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Pessoal" value="Pessoal" />
            <Picker.Item label="Trabalho" value="Trabalho" />
            <Picker.Item label="Estudo" value="Estudo" />
            <Picker.Item label="Saúde" value="Saúde" />
          </Picker>
        </View>
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={pickerMode}
          is24Hour={true}
          display="default"
          onChange={onDateTimeChange}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButton: {
    padding: 5,
  },
  container: {
    padding: 20,
  },
  inputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10,
    marginBottom: 20,
  },
  inputDescription: {
    fontSize: 16,
    color: '#555',
    minHeight: 100,
    textAlignVertical: 'top', 
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden', 
  },
  picker: {
    width: '100%',
  },
});

export default AddEditTaskScreen;