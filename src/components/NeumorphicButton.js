import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../utils/theme';

const NeumorphicButton = ({ title, onPress, style, textStyle, disabled = false }) => {
  const { palette, mode } = React.useContext(ThemeContext);
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.container, { backgroundColor: palette.surface }, style]}>
      <LinearGradient
        colors={disabled ? (mode === 'light' ? ['#d7dbe5', '#c1c8d6'] : ['#1f2937', '#111827']) : (mode === 'light' ? ['#eef1f7', '#d9dee8'] : ['#1f2937', '#111827'])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, { color: palette.textPrimary }, textStyle, disabled && styles.disabledText]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    backgroundColor: '#eef1f7',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  disabledText: {
    color: '#6b7280',
  },
});

export default NeumorphicButton;



