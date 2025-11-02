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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid'; 

const QuickAddTask = ({ visible, onClose, onSaveTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const inputRef = useRef(null); 

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const handleSave = () => {
    if (!title) {
      Alert.alert('Erro', 'O título da tarefa é obrigatório.');
      return;
    }

    const newTask = {
      id: uuidv4(),
      title,
      description,
      category: 'Pessoal', // Categoria Padrão
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dueDate: new Date().toISOString().slice(0, 10), 
      isCompleted: false,
      isStarred: false,
    };

    onSaveTask(newTask); 
    resetAndClose();
  };

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
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
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={resetAndClose} />

        {/* Conteúdo do Modal */}
        <View style={styles.content}>
          <TextInput
            ref={inputRef}
            style={styles.inputTitle}
            placeholder="Insira uma nova tarefa aqui ..."
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.inputDescription}
            placeholder="Adicionar descrição ..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
          />

          {/* Barra de Ações */}
          <View style={styles.actionsRow}>
            <View style={styles.actionIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Text style={styles.categoryChip}>Categoria</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('Ação', 'Abrir seletor de Data/Hora')}>
                <Feather name="clock" size={22} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('Ação', 'Definir Prioridade')}>
                <Feather name="alert-circle" size={22} color="#E74C3C" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('Ação', 'Definir Lembrete')}>
                <Feather name="bell" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Botão Salvar (Check) */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Feather name="check" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 15,
    padding: 5,
  },
  categoryChip: {
    backgroundColor: '#E0E0E0',
    color: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: '500',
    overflow: 'hidden', 
  },
  saveButton: {
    backgroundColor: '#8C4DD5', 
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuickAddTask;