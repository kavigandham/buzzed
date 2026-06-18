// Full drink selection modal (Phase 9).
// Quick slots + recent + search (debounced) + category pills + FlatList of the
// whole library/custom drinks. Tap logs default serving; long-press overrides
// the serving oz; "Add Custom Drink" saves + logs a new drink. Closes on log.

import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDrink } from '../contexts/DrinkContext';
import { getDrinkById } from '../data/drinkLibrary';
import { useDrinkSearch, CATEGORY_PILLS } from '../hooks/useDrinkSearch';
import { LibraryDrink } from '../types';
import { APP_COLORS, CATEGORY_COLORS } from '../constants/colors';
import { RADII, SPACING, TYPE, withAlpha } from '../constants/theme';
import AnimatedGradientBackground from './ui/AnimatedGradientBackground';
import Pill from './ui/Pill';
import PressableScale from './ui/PressableScale';
import GradientButton from './ui/GradientButton';
import GlassCard from './ui/GlassCard';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function DrinkSelectionModal({ visible, onClose }: Props) {
  const { profile, customDrinks, cabinet, logDrink, addCustomDrink } = useDrink();

  const {
    searchInput,
    setSearchInput,
    category,
    setCategory,
    drinks,
    reset: resetSearch,
  } = useDrinkSearch(customDrinks);

  // Long-press serving override.
  const [servingTarget, setServingTarget] = useState<LibraryDrink | null>(null);
  const [servingValue, setServingValue] = useState('');

  // Add-custom inline form.
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customAbv, setCustomAbv] = useState('');
  const [customOz, setCustomOz] = useState('');

  const resolve = (id: string | null): LibraryDrink | undefined =>
    id ? getDrinkById(id) ?? customDrinks.find((d) => d.id === id) : undefined;

  // Last 5 unique cabinet drinks by most recent consumption.
  const recent = useMemo(
    () =>
      [...cabinet]
        .filter((c) => c.lastConsumed > 0)
        .sort((a, b) => b.lastConsumed - a.lastConsumed)
        .slice(0, 5),
    [cabinet]
  );

  const resetAndClose = () => {
    resetSearch();
    setServingTarget(null);
    setServingValue('');
    setShowCustomForm(false);
    setCustomName('');
    setCustomAbv('');
    setCustomOz('');
    onClose();
  };

  const logById = (drinkId: string, servingOz?: number) => {
    logDrink(drinkId, servingOz);
    resetAndClose();
  };

  const openServingOverride = (drink: LibraryDrink) => {
    setServingTarget(drink);
    setServingValue(String(drink.defaultServingOz));
  };

  const confirmServingOverride = () => {
    if (!servingTarget) return;
    const oz = parseFloat(servingValue);
    if (isNaN(oz) || oz <= 0) {
      Alert.alert('Invalid serving', 'Enter a serving size greater than 0 oz.');
      return;
    }
    logById(servingTarget.id, oz);
  };

  const handleAddCustom = () => {
    const name = customName.trim();
    const abvPct = parseFloat(customAbv);
    const oz = parseFloat(customOz);
    if (!name || isNaN(abvPct) || abvPct <= 0 || abvPct > 100 || isNaN(oz) || oz <= 0) {
      Alert.alert(
        'Invalid drink',
        'Enter a name, an ABV between 0 and 100%, and a serving size greater than 0 oz.'
      );
      return;
    }
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'custom';
    const drink: LibraryDrink = {
      id: `${slug}-${Date.now()}`,
      name,
      category: 'other',
      abv: abvPct / 100,
      defaultServingOz: oz,
      tags: ['custom'],
    };
    addCustomDrink(drink); // saves to context (updates ref synchronously)
    logDrink(drink.id); // ...so this resolves immediately
    resetAndClose();
  };

  const renderDrink = ({ item }: { item: LibraryDrink }) => (
    <PressableScale
      style={styles.cardWrap}
      onPress={() => logById(item.id)}
      onLongPress={() => openServingOverride(item)}
    >
      <View style={styles.card}>
        <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[item.category] }]} />
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardMeta}>
            {(item.abv * 100).toFixed(1)}% · {item.defaultServingOz} oz
          </Text>
        </View>
        <Text style={styles.cardHint}>Tap to log</Text>
      </View>
    </PressableScale>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={resetAndClose}>
      <AnimatedGradientBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Log a Drink</Text>
          <TouchableOpacity onPress={resetAndClose} hitSlop={12}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Quick slots */}
        <Text style={styles.sectionLabel}>Quick slots</Text>
        <View style={styles.quickRow}>
          {profile.quickSlots.map((slotId, index) => {
            const drink = resolve(slotId);
            return (
              <PressableScale
                key={index}
                style={styles.quickSlotWrap}
                disabled={!drink}
                onPress={() => drink && logById(drink.id)}
              >
                <View style={[styles.quickSlot, !drink && styles.quickSlotEmpty]}>
                  <Text numberOfLines={2} style={styles.quickSlotText}>
                    {drink ? drink.name : 'Empty'}
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </View>

        {/* Recent */}
        {recent.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Recent</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recentRow}
              contentContainerStyle={styles.recentContent}
            >
              {recent.map((entry) => (
                <TouchableOpacity
                  key={entry.drinkId}
                  style={styles.recentChip}
                  onPress={() => logById(entry.drinkId)}
                >
                  <Text style={styles.recentChipText} numberOfLines={1}>
                    {entry.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Search */}
        <TextInput
          style={styles.search}
          placeholder="Search drinks…"
          placeholderTextColor={APP_COLORS.textSecondary}
          value={searchInput}
          onChangeText={setSearchInput}
          autoCorrect={false}
        />

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsRow}
          contentContainerStyle={styles.pillsContent}
        >
          {CATEGORY_PILLS.map((pill) => (
            <Pill
              key={pill.value}
              label={pill.label}
              active={pill.value === category}
              onPress={() => setCategory(pill.value)}
              style={styles.pillSpacing}
            />
          ))}
        </ScrollView>

        {/* Drink list */}
        <FlatList
          data={drinks}
          keyExtractor={(item) => item.id}
          renderItem={renderDrink}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.empty}>No drinks match.</Text>}
        />

        {/* Add custom drink */}
        <GradientButton
          title={showCustomForm ? 'Close custom form' : '+ Add Custom Drink'}
          variant="outline"
          onPress={() => setShowCustomForm((v) => !v)}
          style={styles.addCustom}
        />
      </SafeAreaView>
      </AnimatedGradientBackground>

      {/* Serving override overlay */}
      <Modal visible={servingTarget !== null} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <GlassCard strong style={styles.overlayCard}>
            <Text style={styles.overlayTitle}>{servingTarget?.name}</Text>
            <Text style={styles.overlayLabel}>Serving size (oz)</Text>
            <TextInput
              style={styles.overlayInput}
              keyboardType="numeric"
              value={servingValue}
              onChangeText={setServingValue}
              autoFocus
            />
            <View style={styles.overlayActions}>
              <TouchableOpacity
                style={styles.overlayCancel}
                onPress={() => setServingTarget(null)}
              >
                <Text style={styles.overlayCancelText}>Cancel</Text>
              </TouchableOpacity>
              <GradientButton title="Log" onPress={confirmServingOverride} />
            </View>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add custom drink overlay form */}
      <Modal visible={showCustomForm} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <GlassCard strong style={styles.overlayCard}>
            <Text style={styles.overlayTitle}>Add Custom Drink</Text>
            <TextInput
              style={styles.overlayInput}
              placeholder="Name"
              placeholderTextColor={APP_COLORS.textSecondary}
              value={customName}
              onChangeText={setCustomName}
            />
            <TextInput
              style={styles.overlayInput}
              placeholder="ABV %"
              placeholderTextColor={APP_COLORS.textSecondary}
              keyboardType="numeric"
              value={customAbv}
              onChangeText={setCustomAbv}
            />
            <TextInput
              style={styles.overlayInput}
              placeholder="Serving oz"
              placeholderTextColor={APP_COLORS.textSecondary}
              keyboardType="numeric"
              value={customOz}
              onChangeText={setCustomOz}
            />
            <View style={styles.overlayActions}>
              <TouchableOpacity
                style={styles.overlayCancel}
                onPress={() => setShowCustomForm(false)}
              >
                <Text style={styles.overlayCancelText}>Cancel</Text>
              </TouchableOpacity>
              <GradientButton title="Save & Log" onPress={handleAddCustom} />
            </View>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  title: { color: APP_COLORS.text, fontSize: 24, fontWeight: '800' },
  close: { color: APP_COLORS.textSecondary, fontSize: 22, fontWeight: '700' },
  sectionLabel: {
    ...TYPE.label,
    color: APP_COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickSlotWrap: { flex: 1, marginHorizontal: 3 },
  quickSlot: {
    backgroundColor: withAlpha(APP_COLORS.surface, 0.85),
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 6,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSlotEmpty: { opacity: 0.5 },
  quickSlotText: {
    color: APP_COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  recentRow: { flexGrow: 0 },
  recentContent: { paddingRight: SPACING.sm },
  recentChip: {
    backgroundColor: withAlpha(APP_COLORS.surface, 0.85),
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: SPACING.sm,
    maxWidth: 160,
  },
  recentChipText: { color: APP_COLORS.text, fontSize: 14, fontWeight: '600' },
  search: {
    backgroundColor: withAlpha(APP_COLORS.surface, 0.85),
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    color: APP_COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  pillsRow: { flexGrow: 0, marginBottom: SPACING.sm },
  pillsContent: { paddingRight: SPACING.sm },
  pillSpacing: { marginRight: SPACING.sm },
  list: { flex: 1 },
  listContent: { paddingBottom: SPACING.md },
  cardWrap: { marginBottom: SPACING.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(APP_COLORS.surface, 0.85),
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    padding: 14,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  cardBody: { flex: 1 },
  cardName: { color: APP_COLORS.text, fontSize: 16, fontWeight: '600' },
  cardMeta: { color: APP_COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  cardHint: { color: APP_COLORS.textSecondary, fontSize: 12 },
  empty: { color: APP_COLORS.textSecondary, fontSize: 15, textAlign: 'center', marginTop: SPACING.xxl },
  addCustom: { marginVertical: SPACING.md },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  overlayCard: { padding: SPACING.xl },
  overlayTitle: { color: APP_COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 12 },
  overlayLabel: { color: APP_COLORS.textSecondary, fontSize: 13, marginBottom: 6 },
  overlayInput: {
    backgroundColor: withAlpha('#000000', 0.25),
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    color: APP_COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  overlayActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
  overlayCancel: { paddingVertical: 12, paddingHorizontal: 16 },
  overlayCancelText: { color: APP_COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
});
