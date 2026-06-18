// Home screen. All real-time values come from useDrink() (the context ticker) —
// this screen runs NO setInterval of its own. Re-renders are driven by the
// context updating activeStdDrinks etc. every second, which also recomputes the
// per-drink progress bars below from Date.now().

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDrink } from '../contexts/DrinkContext';
import { getDrinkById } from '../data/drinkLibrary';
import { calcRemaining } from '../utils/drinkCalculator';
import { LibraryDrink, LoggedDrink } from '../types';
import { APP_COLORS } from '../constants/colors';
import { RADII, SPACING, TYPE, withAlpha } from '../constants/theme';
import DrinkSelectionModal from '../components/DrinkSelectionModal';
import AnimatedGradientBackground from '../components/ui/AnimatedGradientBackground';
import LevelMeter from '../components/ui/LevelMeter';
import GradientButton from '../components/ui/GradientButton';
import PressableScale from '../components/ui/PressableScale';

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
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Buzzed.</Text>
          {profile.name.trim().length > 0 && (
            <Text style={styles.greeting}>Hey, {profile.name.trim()}</Text>
          )}

          {/* Hero level meter */}
          <LevelMeter
            levelName={levelConfig.name}
            color={levelConfig.color}
            activeStdDrinks={activeStdDrinks}
            timeLabel={formatTimeToSober(timeToSober)}
          />

          {/* Quick slots */}
          <View style={styles.quickRow}>
            {profile.quickSlots.map((slotId, index) => {
              const drink = resolveSlot(slotId);
              return (
                <PressableScale
                  key={index}
                  style={styles.quickSlotWrap}
                  disabled={!drink}
                  onPress={() => drink && logDrink(drink.id)}
                >
                  <View style={[styles.quickSlot, !drink && styles.quickSlotEmpty]}>
                    <Text
                      numberOfLines={2}
                      style={[styles.quickSlotText, !drink && styles.quickSlotTextEmpty]}
                    >
                      {drink ? drink.name : 'Configure'}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>

          {/* Log a Drink */}
          <GradientButton
            title="+ Log a Drink"
            onPress={() => setModalVisible(true)}
            style={styles.logButton}
          />

          {/* Active drink list */}
          <Text style={styles.sectionHeader}>This session</Text>
          {loggedDrinks.length === 0 ? (
            <Text style={styles.emptyText}>No drinks logged yet.</Text>
          ) : (
            loggedDrinks.map((drink) => (
              <SessionDrinkRow
                key={drink.id}
                drink={drink}
                now={now}
                color={levelConfig.color}
              />
            ))
          )}

          {/* Restart session */}
          <GradientButton
            title="Restart Session"
            variant="danger"
            onPress={confirmRestart}
            style={styles.restartButton}
          />

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
        </ScrollView>
      </SafeAreaView>

      <DrinkSelectionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </AnimatedGradientBackground>
  );
}

// One session drink: fades/slides in on mount, animates its decay bar width.
function SessionDrinkRow({
  drink,
  now,
  color,
}: {
  drink: LoggedDrink;
  now: number;
  color: string;
}) {
  const enter = useRef(new Animated.Value(0)).current;
  const fill = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [enter]);

  const remaining = calcRemaining(drink.standardDrinks, now - drink.timestamp);
  const pct =
    drink.standardDrinks > 0
      ? Math.max(0, Math.min(1, remaining / drink.standardDrinks))
      : 0;
  const decayed = remaining <= 0;

  useEffect(() => {
    Animated.timing(fill, { toValue: pct, duration: 500, useNativeDriver: false }).start();
  }, [pct, fill]);

  const fillWidth = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View
      style={[
        styles.drinkRow,
        decayed && styles.drinkRowDecayed,
        {
          opacity: enter,
          transform: [
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.drinkRowTop}>
        <Text style={styles.drinkName} numberOfLines={1}>
          {drink.name}
        </Text>
        <Text style={styles.drinkRemaining}>{remaining.toFixed(2)}</Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: fillWidth, backgroundColor: color }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 48,
  },
  title: {
    ...TYPE.display,
    color: APP_COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  greeting: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  quickSlotWrap: { flex: 1, marginHorizontal: SPACING.xs },
  quickSlot: {
    backgroundColor: withAlpha(APP_COLORS.surface, 0.85),
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    minHeight: 64,
    justifyContent: 'center',
  },
  quickSlotEmpty: {
    opacity: 0.6,
  },
  quickSlotText: {
    color: APP_COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  quickSlotTextEmpty: {
    color: APP_COLORS.textSecondary,
    fontWeight: '400',
  },
  logButton: {
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    ...TYPE.label,
    color: APP_COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: APP_COLORS.textSecondary,
    fontSize: 15,
    marginBottom: SPACING.lg,
  },
  drinkRow: {
    backgroundColor: withAlpha(APP_COLORS.surface, 0.85),
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  drinkRowDecayed: {
    opacity: 0.4,
  },
  drinkRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  drinkName: {
    color: APP_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  drinkRemaining: {
    color: APP_COLORS.textSecondary,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: withAlpha('#000000', 0.35),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  restartButton: {
    marginTop: SPACING.lg,
  },
  disclaimer: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.xxl,
    lineHeight: 18,
  },
});
