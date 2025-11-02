import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons'; 
const CustomCheckbox = ({ isChecked, onPress, label }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {/* A "caixa" do checkbox */}
      <View style={[styles.box, isChecked && styles.boxChecked]}>
        {isChecked && (
          <Feather name="check" size={16} color="#FFFFFF" />
        )}
      </View>
      
      {/* O texto "Lembrar-me" */}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8C4DD5', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, 
  },
  boxChecked: {
    backgroundColor: '#8C4DD5', 
    borderColor: '#8C4DD5',
  },
  label: {
    color: '#555',
    fontSize: 14,
  },
});

export default CustomCheckbox;