// Home screen. All real-time values come from useDrink() (the context ticker) —
// this screen runs NO setInterval of its own. Re-renders are driven by the
// context updating activeStdDrinks etc. every second, which also recomputes the
// per-drink progress bars below from Date.now().

import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useDrink } from '../contexts/DrinkContext';
import { getDrinkById } from '../data/drinkLibrary';
import { calcRemaining } from '../utils/drinkCalculator';
import { LibraryDrink } from '../types';
import { APP_COLORS } from '../constants/colors';
import DrinkSelectionModal from '../components/DrinkSelectionModal';

const GRADIENT = ['#0F1115', '#1A1430', '#1A1D23'] as const;
const DISCLAIMER =
  'For entertainment only. Do not use to determine fitness to drive.';

function formatTimeToSober(seconds: number): string {
  if (seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function MainScreen() {
  const {
    activeStdDrinks,
    levelConfig,
    timeToSober,
    loggedDrinks,
    profile,
    customDrinks,
    logDrink,
    restartSession,
  } = useDrink();

  const [modalVisible, setModalVisible] = useState(false);

  const resolveSlot = (id: string | null): LibraryDrink | undefined =>
    id ? getDrinkById(id) ?? customDrinks.find((d) => d.id === id) : undefined;

  const confirmRestart = () => {
    Alert.alert(
      'Restart Session',
      'Clear all drinks from the current session? Your cabinet and calendar history are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restart', style: 'destructive', onPress: restartSession },
      ]
    );
  };

  // Recomputed on every render (i.e. every context tick) from Date.now().
  const now = Date.now();

  return (
    <LinearGradient colors={GRADIENT} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Buzzed.</Text>

          {/* Level chip */}
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: levelConfig.color }]}>
              <Text style={styles.chipText}>{levelConfig.name}</Text>
            </View>
          </View>

          {/* Active standard drinks */}
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{activeStdDrinks.toFixed(3)}</Text>
            <Text style={styles.statLabel}>active standard drinks</Text>
          </View>

          {/* Time to sober */}
          <View style={styles.statBlock}>
            <Text style={styles.soberTime}>{formatTimeToSober(timeToSober)}</Text>
            <Text style={styles.statLabel}>until sober</Text>
          </View>

          {/* Quick slots */}
          <View style={styles.quickRow}>
            {profile.quickSlots.map((slotId, index) => {
              const drink = resolveSlot(slotId);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickSlot, !drink && styles.quickSlotEmpty]}
                  disabled={!drink}
                  onPress={() => drink && logDrink(drink.id)}
                >
                  <Text
                    numberOfLines={2}
                    style={[styles.quickSlotText, !drink && styles.quickSlotTextEmpty]}
                  >
                    {drink ? drink.name : 'Configure'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Log a Drink */}
          <TouchableOpacity style={styles.logButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.logButtonText}>+ Log a Drink</Text>
          </TouchableOpacity>

          {/* Active drink list */}
          <Text style={styles.sectionHeader}>This session</Text>
          {loggedDrinks.length === 0 ? (
            <Text style={styles.emptyText}>No drinks logged yet.</Text>
          ) : (
            loggedDrinks.map((drink) => {
              const remaining = calcRemaining(drink.standardDrinks, now - drink.timestamp);
              const pct =
                drink.standardDrinks > 0
                  ? Math.max(0, Math.min(1, remaining / drink.standardDrinks))
                  : 0;
              const decayed = remaining <= 0;
              return (
                <View
                  key={drink.id}
                  style={[styles.drinkRow, decayed && styles.drinkRowDecayed]}
                >
                  <View style={styles.drinkRowTop}>
                    <Text style={styles.drinkName} numberOfLines={1}>
                      {drink.name}
                    </Text>
                    <Text style={styles.drinkRemaining}>{remaining.toFixed(3)}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct * 100}%`, backgroundColor: levelConfig.color },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}

          {/* Restart session */}
          <TouchableOpacity style={styles.restartButton} onPress={confirmRestart}>
            <Text style={styles.restartText}>Restart Session</Text>
          </TouchableOpacity>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
        </ScrollView>
      </SafeAreaView>

      <DrinkSelectionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  title: {
    color: APP_COLORS.text,
    fontSize: 44,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statBlock: {
    marginBottom: 18,
  },
  statNumber: {
    color: APP_COLORS.text,
    fontSize: 52,
    fontWeight: '800',
  },
  soberTime: {
    color: APP_COLORS.text,
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickSlot: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  quickSlotEmpty: {
    opacity: 0.6,
  },
  quickSlotText: {
    color: APP_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickSlotTextEmpty: {
    color: APP_COLORS.textSecondary,
    fontWeight: '400',
  },
  logButton: {
    backgroundColor: APP_COLORS.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHeader: {
    color: APP_COLORS.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  emptyText: {
    color: APP_COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 16,
  },
  drinkRow: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  drinkRowDecayed: {
    opacity: 0.4,
  },
  drinkRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  drinkName: {
    color: APP_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  drinkRemaining: {
    color: APP_COLORS.textSecondary,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: APP_COLORS.background,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  restartButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  restartText: {
    color: APP_COLORS.danger,
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 28,
    lineHeight: 18,
  },
});
