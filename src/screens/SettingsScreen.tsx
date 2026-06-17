// Settings: name, quick-slot configuration, session/data clearing, app info.
// All changes persist immediately through context.updateProfile (-> StorageService).

import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDrink } from '../contexts/DrinkContext';
import { useDrinkSearch } from '../hooks/useDrinkSearch';
import { getDrinkById } from '../data/drinkLibrary';
import { LibraryDrink, UserProfile } from '../types';
import { APP_COLORS, CATEGORY_COLORS } from '../constants/colors';

const APP_VERSION = 'Buzzed. v1.0.0';
const DISCLAIMER = 'For entertainment only. Do not use to determine fitness to drive.';

export default function SettingsScreen() {
  const { profile, customDrinks, updateProfile, restartSession, clearAll } = useDrink();
  const { searchInput, setSearchInput, drinks, reset } = useDrinkSearch(customDrinks);

  // Which quick slot (0/1/2) the picker is currently editing.
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  const resolve = (id: string | null): LibraryDrink | undefined =>
    id ? getDrinkById(id) ?? customDrinks.find((d) => d.id === id) : undefined;

  const setName = (name: string) => updateProfile({ ...profile, name });

  const setSlot = (index: number, drinkId: string | null) => {
    const next: UserProfile['quickSlots'] = [...profile.quickSlots];
    next[index] = drinkId;
    updateProfile({ ...profile, quickSlots: next });
  };

  const openPicker = (index: number) => {
    reset();
    setPickerSlot(index);
  };

  const choose = (drinkId: string | null) => {
    if (pickerSlot !== null) setSlot(pickerSlot, drinkId);
    setPickerSlot(null);
  };

  const confirmClearSession = () => {
    Alert.alert('Clear Session', 'Clear all drinks from the current session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: restartSession },
    ]);
  };

  const confirmClearAll = () => {
    Alert.alert('Clear All Data', 'This will erase your profile, session, cabinet, and calendar.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Are you sure?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete Everything', style: 'destructive', onPress: clearAll },
          ]),
      },
    ]);
  };

  const renderPickerItem = ({ item }: { item: LibraryDrink }) => (
    <TouchableOpacity style={styles.pickRow} onPress={() => choose(item.id)}>
      <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[item.category] }]} />
      <Text style={styles.pickName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.pickMeta}>{(item.abv * 100).toFixed(1)}%</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Settings</Text>

        {/* Name */}
        <Text style={styles.sectionLabel}>Your name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor={APP_COLORS.textSecondary}
          value={profile.name}
          onChangeText={setName}
        />

        {/* Quick slots */}
        <Text style={styles.sectionLabel}>Quick slots</Text>
        {[0, 1, 2].map((index) => {
          const drink = resolve(profile.quickSlots[index]);
          return (
            <TouchableOpacity key={index} style={styles.slotRow} onPress={() => openPicker(index)}>
              <Text style={styles.slotIndex}>Slot {index + 1}</Text>
              <Text style={[styles.slotValue, !drink && styles.slotValueEmpty]} numberOfLines={1}>
                {drink ? drink.name : 'Not configured'}
              </Text>
              <Text style={styles.slotChevron}>›</Text>
            </TouchableOpacity>
          );
        })}

        {/* Actions */}
        <Text style={styles.sectionLabel}>Data</Text>
        <TouchableOpacity style={styles.actionButton} onPress={confirmClearSession}>
          <Text style={styles.actionText}>Clear Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={confirmClearAll}>
          <Text style={styles.dangerText}>Clear All Data</Text>
        </TouchableOpacity>

        {/* App info */}
        <View style={styles.info}>
          <Text style={styles.version}>{APP_VERSION}</Text>
          <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
        </View>
      </ScrollView>

      {/* Quick slot picker */}
      <Modal visible={pickerSlot !== null} animationType="slide" onRequestClose={() => setPickerSlot(null)}>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <View style={styles.pickHeader}>
            <Text style={styles.pickTitle}>
              {pickerSlot !== null ? `Configure slot ${pickerSlot + 1}` : ''}
            </Text>
            <TouchableOpacity onPress={() => setPickerSlot(null)} hitSlop={12}>
              <Text style={styles.pickClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickBody}>
            <TextInput
              style={styles.input}
              placeholder="Search drinks…"
              placeholderTextColor={APP_COLORS.textSecondary}
              value={searchInput}
              onChangeText={setSearchInput}
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.clearSlotRow} onPress={() => choose(null)}>
              <Text style={styles.clearSlotText}>None (clear slot)</Text>
            </TouchableOpacity>
            <FlatList
              data={drinks}
              keyExtractor={(item) => item.id}
              renderItem={renderPickerItem}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  title: { color: APP_COLORS.text, fontSize: 28, fontWeight: '800', marginTop: 8, marginBottom: 8 },
  sectionLabel: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    color: APP_COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  slotIndex: { color: APP_COLORS.textSecondary, fontSize: 14, width: 64 },
  slotValue: { color: APP_COLORS.text, fontSize: 16, fontWeight: '600', flex: 1 },
  slotValueEmpty: { color: APP_COLORS.textSecondary, fontWeight: '400' },
  slotChevron: { color: APP_COLORS.textSecondary, fontSize: 22, marginLeft: 8 },
  actionButton: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  actionText: { color: APP_COLORS.text, fontSize: 16, fontWeight: '600' },
  dangerButton: { borderColor: APP_COLORS.danger },
  dangerText: { color: APP_COLORS.danger, fontSize: 16, fontWeight: '700' },
  info: { marginTop: 28, alignItems: 'center' },
  version: { color: APP_COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  disclaimer: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Picker
  pickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  pickTitle: { color: APP_COLORS.text, fontSize: 20, fontWeight: '800' },
  pickClose: { color: APP_COLORS.textSecondary, fontSize: 22, fontWeight: '700' },
  pickBody: { flex: 1, paddingHorizontal: 16 },
  clearSlotRow: {
    paddingVertical: 14,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  clearSlotText: { color: APP_COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  pickName: { color: APP_COLORS.text, fontSize: 16, flex: 1 },
  pickMeta: { color: APP_COLORS.textSecondary, fontSize: 14 },
});
