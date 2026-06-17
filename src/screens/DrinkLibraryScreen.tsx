// Browsable drink catalog. Reuses the shared useDrinkSearch hook (same search /
// filter behavior as the DrinkSelectionModal). Tapping a card opens a detail
// modal with the standard-drink calculation and a "Log This Drink" action.

import { useState } from 'react';
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
import { useDrinkSearch, CATEGORY_PILLS } from '../hooks/useDrinkSearch';
import { calcStandardDrinks } from '../utils/drinkCalculator';
import { LibraryDrink } from '../types';
import { APP_COLORS, CATEGORY_COLORS } from '../constants/colors';

function categoryLabel(value: string): string {
  const pill = CATEGORY_PILLS.find((p) => p.value === value);
  if (pill) return pill.label;
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function DrinkLibraryScreen() {
  const { customDrinks, logDrink, addCustomDrink } = useDrink();
  const { searchInput, setSearchInput, category, setCategory, drinks, totalCount } =
    useDrinkSearch(customDrinks);

  // Detail modal.
  const [detailDrink, setDetailDrink] = useState<LibraryDrink | null>(null);
  const [detailServing, setDetailServing] = useState('');

  // Add custom form.
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customAbv, setCustomAbv] = useState('');
  const [customOz, setCustomOz] = useState('');

  const openDetail = (drink: LibraryDrink) => {
    setDetailDrink(drink);
    setDetailServing(String(drink.defaultServingOz));
  };

  const detailServingOz = (): number => {
    const parsed = parseFloat(detailServing);
    return isNaN(parsed) || parsed <= 0 ? (detailDrink?.defaultServingOz ?? 0) : parsed;
  };

  const logFromDetail = () => {
    if (!detailDrink) return;
    const oz = detailServingOz();
    logDrink(detailDrink.id, oz);
    const name = detailDrink.name;
    setDetailDrink(null);
    // Brief confirmation — stay on the Library tab.
    Alert.alert('Logged', `${name} added to your session.`);
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
    addCustomDrink(drink);
    setShowCustomForm(false);
    setCustomName('');
    setCustomAbv('');
    setCustomOz('');
    Alert.alert('Saved', `${name} added to your custom drinks.`);
  };

  const renderItem = ({ item }: { item: LibraryDrink }) => (
    <TouchableOpacity style={styles.card} onPress={() => openDetail(item)}>
      <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[item.category] }]} />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardMeta}>
          {categoryLabel(item.category)} · {(item.abv * 100).toFixed(1)}% · {item.defaultServingOz} oz
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Library</Text>

      <TextInput
        style={styles.search}
        placeholder="Search drinks…"
        placeholderTextColor={APP_COLORS.textSecondary}
        value={searchInput}
        onChangeText={setSearchInput}
        autoCorrect={false}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsRow}
        contentContainerStyle={styles.pillsContent}
      >
        {CATEGORY_PILLS.map((pill) => {
          const active = pill.value === category;
          return (
            <TouchableOpacity
              key={pill.value}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setCategory(pill.value)}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{pill.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.count}>
        Showing {drinks.length} of {totalCount} drinks
      </Text>

      <FlatList
        data={drinks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>No drinks match your search</Text>}
      />

      <TouchableOpacity style={styles.addCustomButton} onPress={() => setShowCustomForm(true)}>
        <Text style={styles.addCustomText}>+ Add Custom Drink</Text>
      </TouchableOpacity>

      {/* Detail modal */}
      <Modal visible={detailDrink !== null} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <View style={styles.detailCard}>
            {detailDrink && (
              <>
                <View style={styles.detailHeader}>
                  <View
                    style={[styles.dotLarge, { backgroundColor: CATEGORY_COLORS[detailDrink.category] }]}
                  />
                  <Text style={styles.detailName}>{detailDrink.name}</Text>
                </View>

                <Text style={styles.detailRow}>Category: {categoryLabel(detailDrink.category)}</Text>
                <Text style={styles.detailRow}>ABV: {(detailDrink.abv * 100).toFixed(1)}%</Text>
                <Text style={styles.detailRow}>Default serving: {detailDrink.defaultServingOz} oz</Text>

                <Text style={styles.detailLabel}>Serving size (oz)</Text>
                <TextInput
                  style={styles.detailInput}
                  keyboardType="numeric"
                  value={detailServing}
                  onChangeText={setDetailServing}
                />

                <Text style={styles.calc}>
                  = {calcStandardDrinks(detailServingOz(), detailDrink.abv).toFixed(2)} standard drinks
                </Text>

                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.detailCancel} onPress={() => setDetailDrink(null)}>
                    <Text style={styles.detailCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.detailLog} onPress={logFromDetail}>
                    <Text style={styles.detailLogText}>Log This Drink</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add custom drink form */}
      <Modal visible={showCustomForm} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <View style={styles.detailCard}>
            <Text style={styles.detailName}>Add Custom Drink</Text>
            <TextInput
              style={styles.detailInput}
              placeholder="Name"
              placeholderTextColor={APP_COLORS.textSecondary}
              value={customName}
              onChangeText={setCustomName}
            />
            <TextInput
              style={styles.detailInput}
              placeholder="ABV %"
              placeholderTextColor={APP_COLORS.textSecondary}
              keyboardType="numeric"
              value={customAbv}
              onChangeText={setCustomAbv}
            />
            <TextInput
              style={styles.detailInput}
              placeholder="Serving oz"
              placeholderTextColor={APP_COLORS.textSecondary}
              keyboardType="numeric"
              value={customOz}
              onChangeText={setCustomOz}
            />
            <View style={styles.detailActions}>
              <TouchableOpacity
                style={styles.detailCancel}
                onPress={() => setShowCustomForm(false)}
              >
                <Text style={styles.detailCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailLog} onPress={handleAddCustom}>
                <Text style={styles.detailLogText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background, paddingHorizontal: 16 },
  title: { color: APP_COLORS.text, fontSize: 28, fontWeight: '800', marginTop: 8, marginBottom: 12 },
  search: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    color: APP_COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  pillsRow: { flexGrow: 0, marginBottom: 8 },
  pillsContent: { paddingRight: 8 },
  pill: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  pillActive: { backgroundColor: APP_COLORS.accent, borderColor: APP_COLORS.accent },
  pillText: { color: APP_COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF' },
  count: { color: APP_COLORS.textSecondary, fontSize: 13, marginBottom: 10 },
  list: { flex: 1 },
  listContent: { paddingBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  cardBody: { flex: 1 },
  cardName: { color: APP_COLORS.text, fontSize: 16, fontWeight: '600' },
  cardMeta: { color: APP_COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  empty: { color: APP_COLORS.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 24 },
  addCustomButton: {
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 10,
  },
  addCustomText: { color: APP_COLORS.accent, fontSize: 16, fontWeight: '700' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  detailCard: { backgroundColor: APP_COLORS.surface, borderRadius: 16, padding: 20 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dotLarge: { width: 16, height: 16, borderRadius: 8, marginRight: 10 },
  detailName: { color: APP_COLORS.text, fontSize: 22, fontWeight: '800', flexShrink: 1 },
  detailRow: { color: APP_COLORS.textSecondary, fontSize: 15, marginBottom: 4 },
  detailLabel: { color: APP_COLORS.textSecondary, fontSize: 13, marginTop: 12, marginBottom: 6 },
  detailInput: {
    backgroundColor: APP_COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    color: APP_COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  calc: { color: APP_COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  detailActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  detailCancel: { paddingVertical: 12, paddingHorizontal: 16 },
  detailCancelText: { color: APP_COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  detailLog: {
    backgroundColor: APP_COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  detailLogText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
