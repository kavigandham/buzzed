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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useDrink } from '../contexts/DrinkContext';
import { useDrinkSearch } from '../hooks/useDrinkSearch';
import { getDrinkById } from '../data/drinkLibrary';
import { LibraryDrink, UserProfile } from '../types';
import { APP_COLORS, CATEGORY_COLORS } from '../constants/colors';
import { RADII, SPACING, TYPE, withAlpha } from '../constants/theme';
import AnimatedGradientBackground from '../components/ui/AnimatedGradientBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GradientButton from '../components/ui/GradientButton';
import PressableScale from '../components/ui/PressableScale';

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
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Settings" />

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
              <PressableScale key={index} onPress={() => openPicker(index)} style={styles.slotWrap}>
                <View style={styles.slotRow}>
                  <Text style={styles.slotIndex}>Slot {index + 1}</Text>
                  <Text style={[styles.slotValue, !drink && styles.slotValueEmpty]} numberOfLines={1}>
                    {drink ? drink.name : 'Not configured'}
                  </Text>
                  <Text style={styles.slotChevron}>›</Text>
                </View>
              </PressableScale>
            );
          })}

          {/* Actions */}
          <Text style={styles.sectionLabel}>Data</Text>
          <GradientButton
            title="Clear Session"
            variant="outline"
            onPress={confirmClearSession}
            style={styles.actionSpacing}
          />
          <GradientButton
            title="Clear All Data"
            variant="danger"
            onPress={confirmClearAll}
            style={styles.actionSpacing}
          />

          {/* App info */}
          <View style={styles.info}>
            <Text style={styles.version}>{APP_VERSION}</Text>
            <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
          </View>
        </ScrollView>

        {/* Quick slot picker */}
        <Modal visible={pickerSlot !== null} animationType="slide" onRequestClose={() => setPickerSlot(null)}>
          <SafeAreaProvider>
            <AnimatedGradientBackground>
              <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
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
            </AnimatedGradientBackground>
          </SafeAreaProvider>
        </Modal>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  sectionLabel: {
    ...TYPE.label,
    color: APP_COLORS.textSecondary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: withAlpha(APP_COLORS.surface, 0.85),
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    color: APP_COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  slotWrap: { marginBottom: SPACING.sm },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(APP_COLORS.surface, 0.85),
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  slotIndex: { color: APP_COLORS.textSecondary, fontSize: 14, width: 64 },
  slotValue: { color: APP_COLORS.text, fontSize: 16, fontWeight: '600', flex: 1 },
  slotValueEmpty: { color: APP_COLORS.textSecondary, fontWeight: '400' },
  slotChevron: { color: APP_COLORS.textSecondary, fontSize: 22, marginLeft: 8 },
  actionSpacing: { marginBottom: SPACING.md },
  info: { marginTop: SPACING.xxl, alignItems: 'center' },
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  pickTitle: { ...TYPE.h2, color: APP_COLORS.text, fontSize: 20, fontWeight: '800' },
  pickClose: { color: APP_COLORS.textSecondary, fontSize: 22, fontWeight: '700' },
  pickBody: { flex: 1, paddingHorizontal: SPACING.lg },
  clearSlotRow: {
    paddingVertical: 14,
    marginTop: SPACING.sm,
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
