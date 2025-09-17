import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../utils/theme';

const NeumorphicInput = ({ placeholder, value, onChangeText, style, multiline = false, keyboardType = 'default' }) => {
  const { palette, mode } = React.useContext(ThemeContext);
  return (
    <View style={[styles.container, { backgroundColor: palette.surface }, style]}>
      <LinearGradient
        colors={mode === 'light' ? ['#eef1f7', '#d9dee8'] : ['#1f2937', '#111827']}
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
          placeholderTextColor={mode === 'light' ? '#6b7280' : '#9ca3af'}
          color={palette.textPrimary}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    backgroundColor: '#eef1f7',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
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
    color: '#111827',
    minHeight: 20,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default NeumorphicInput;



