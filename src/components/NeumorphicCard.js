import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const NeumorphicCard = ({ children, onPress, style, disabled = false }) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent onPress={onPress} disabled={disabled} style={[styles.container, style]}>
      <LinearGradient
        colors={['#f0f0f3', '#cacace']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.innerShadow}>
          {children}
        </View>
      </LinearGradient>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 6,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
  },
  innerShadow: {
    borderRadius: 15,
    shadowColor: '#fff',
    shadowOffset: {
      width: -3,
      height: -3,
    },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: -2,
  },
});

export default NeumorphicCard;



