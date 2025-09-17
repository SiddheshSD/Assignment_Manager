import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import NeumorphicCard from './NeumorphicCard';
import { clearAllData, loadTheme, saveTheme } from '../utils/storage';

const Header = ({ navigation, title, showBack }) => {
  const { mode, palette, setMode } = React.useContext(ThemeContext);
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleTheme = async () => {
    const next = mode === 'light' ? 'dark' : 'light';
    await setMode(next);
    setMenuVisible(false);
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all assignments, experiments and test scores. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: async () => { await clearAllData(); setMenuVisible(false); } },
      ]
    );
  };

  const canGoBack = typeof showBack === 'boolean' ? showBack : (navigation?.canGoBack?.() || false);

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: palette.background }]}> 
      <View style={styles.leftGroup}>
        {canGoBack && (
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={palette.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={[styles.logoCircle, { backgroundColor: palette.surface }]}> 
          <Ionicons name="school" size={20} color={palette.accent} />
        </View>
        <Text style={[styles.appName, { color: palette.textPrimary }]}>ASS APP</Text>
        <Text style={[styles.headerTitle, { color: palette.textSecondary }]}> · {title}</Text>
      </View>

      <TouchableOpacity style={styles.iconButton} onPress={() => setMenuVisible(true)}>
        <Ionicons name="ellipsis-vertical" size={20} color={palette.textPrimary} />
      </TouchableOpacity>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View />
        </Pressable>
        <View style={[styles.menuContainer, { backgroundColor: palette.surface }]}> 
          <TouchableOpacity style={styles.menuItemRow} onPress={toggleTheme}>
            <Ionicons name="color-palette-outline" size={18} color={palette.textPrimary} />
            <Text style={[styles.menuText, { color: palette.textPrimary }]}>Switch to {mode === 'light' ? 'Dark' : 'Light'} Mode</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItemRow} onPress={handleClearData}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={[styles.menuText, { color: '#ef4444' }]}>Clear All App Data</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <View style={styles.copyrightRow}>
            <Text style={[styles.copyright, { color: palette.textSecondary }]}>© SiddheshSD</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headerTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 12,
    width: 260,
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#00000020',
    marginVertical: 2,
  },
  menuText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  copyrightRow: {
    alignItems: 'center',
    paddingTop: 6,
  },
  copyright: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
});

export default Header;


