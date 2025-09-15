import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const NeumorphicButton = ({ title, onPress, style, textStyle, disabled = false }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.container, style]}>
      <LinearGradient
        colors={disabled ? ['#e0e0e0', '#b0b0b0'] : ['#f0f0f3', '#cacace']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
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
    fontWeight: '600',
    color: '#6366f1',
  },
  disabledText: {
    color: '#999',
  },
});

export default NeumorphicButton;



