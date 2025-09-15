import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const NeumorphicInput = ({ placeholder, value, onChangeText, style, multiline = false, keyboardType = 'default' }) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#f0f0f3', '#cacace']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholderTextColor="#999"
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  gradient: {
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    color: '#333',
    minHeight: 20,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default NeumorphicInput;



