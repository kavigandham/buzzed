// Basic drink selection modal (Phase 8). Shows the 3 configured quick slots
// and a cancel button. Full library search arrives in Phase 9.

import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDrink } from '../contexts/DrinkContext';
import { getDrinkById } from '../data/drinkLibrary';
import { LibraryDrink } from '../types';
import { APP_COLORS } from '../constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function DrinkSelectionModal({ visible, onClose }: Props) {
  const { profile, customDrinks, logDrink } = useDrink();

  const resolve = (id: string | null): LibraryDrink | undefined =>
    id ? getDrinkById(id) ?? customDrinks.find((d) => d.id === id) : undefined;

  const handleLog = (drink: LibraryDrink) => {
    logDrink(drink.id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Log a Drink</Text>
          <Text style={styles.subtitle}>Quick slots</Text>

          {profile.quickSlots.map((slotId, index) => {
            const drink = resolve(slotId);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.slot, !drink && styles.slotEmpty]}
                disabled={!drink}
                onPress={() => drink && handleLog(drink)}
              >
                <Text style={[styles.slotText, !drink && styles.slotTextEmpty]}>
                  {drink ? drink.name : `Slot ${index + 1} — empty`}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: APP_COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    color: APP_COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  slot: {
    backgroundColor: APP_COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  slotEmpty: {
    opacity: 0.5,
  },
  slotText: {
    color: APP_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  slotTextEmpty: {
    color: APP_COLORS.textSecondary,
    fontWeight: '400',
  },
  cancel: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
