import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../utils/theme';

const NeumorphicCard = ({ children, onPress, style, disabled = false }) => {
  const { palette, mode } = React.useContext(ThemeContext);
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent onPress={onPress} disabled={disabled} style={[styles.container, { backgroundColor: palette.surface }, style]}>
      <LinearGradient
        colors={mode === 'light' ? ['#eef1f7', '#d9dee8'] : ['#1f2937', '#111827']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eef1f7',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
  },
  content: {
    borderRadius: 16,
  },
});

export default NeumorphicCard;



