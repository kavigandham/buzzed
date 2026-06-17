// Shared drink detail modal: shows a drink's stats + the standard-drink
// calculation for an (optionally overridden) serving size, then logs it.

import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { calcStandardDrinks } from '../utils/drinkCalculator';
import { DrinkCategory } from '../types';
import { APP_COLORS, CATEGORY_COLORS } from '../constants/colors';

export interface DetailDrink {
  id: string;
  name: string;
  category: DrinkCategory;
  abv: number;
  defaultServingOz: number;
}

interface Props {
  drink: DetailDrink | null;
  onClose: () => void;
  onLog: (drinkId: string, servingOz: number) => void;
}

function categoryLabel(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function DrinkDetailModal({ drink, onClose, onLog }: Props) {
  const [serving, setServing] = useState('');

  useEffect(() => {
    if (drink) setServing(String(drink.defaultServingOz));
  }, [drink]);

  const servingOz = (): number => {
    const parsed = parseFloat(serving);
    return isNaN(parsed) || parsed <= 0 ? (drink?.defaultServingOz ?? 0) : parsed;
  };

  const handleLog = () => {
    if (!drink) return;
    onLog(drink.id, servingOz());
    onClose();
  };

  return (
    <Modal visible={drink !== null} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          {drink && (
            <>
              <View style={styles.header}>
                <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[drink.category] }]} />
                <Text style={styles.name}>{drink.name}</Text>
              </View>

              <Text style={styles.row}>Category: {categoryLabel(drink.category)}</Text>
              <Text style={styles.row}>ABV: {(drink.abv * 100).toFixed(1)}%</Text>
              <Text style={styles.row}>Default serving: {drink.defaultServingOz} oz</Text>

              <Text style={styles.label}>Serving size (oz)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={serving}
                onChangeText={setServing}
              />

              <Text style={styles.calc}>
                = {calcStandardDrinks(servingOz(), drink.abv).toFixed(2)} standard drinks
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancel} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.log} onPress={handleLog}>
                  <Text style={styles.logText}>Log This Drink</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: { backgroundColor: APP_COLORS.surface, borderRadius: 16, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dot: { width: 16, height: 16, borderRadius: 8, marginRight: 10 },
  name: { color: APP_COLORS.text, fontSize: 22, fontWeight: '800', flexShrink: 1 },
  row: { color: APP_COLORS.textSecondary, fontSize: 15, marginBottom: 4 },
  label: { color: APP_COLORS.textSecondary, fontSize: 13, marginTop: 12, marginBottom: 6 },
  input: {
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
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  cancel: { paddingVertical: 12, paddingHorizontal: 16 },
  cancelText: { color: APP_COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  log: {
    backgroundColor: APP_COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  logText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
