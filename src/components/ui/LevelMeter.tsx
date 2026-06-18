// Home hero: a glowing glass card showing the current impairment level, the live
// active-standard-drinks number, time-to-sober, and an animated intensity meter.
//
// - The number is bound directly to props (no per-tick count-up — that would jitter
//   against the 1-second context ticker).
// - The meter fill width animates whenever the value changes.
// - A soft halo pulses continuously; its color is the (colorblind-safe) level color.
// All Animated.Values are useRef-stable; the pulse loop stops on unmount.

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS } from '../../constants/colors';
import { RADII, SPACING, TYPE, withAlpha } from '../../constants/theme';
import GlassCard from './GlassCard';

// Active std drinks at the top of the Danger band — used to normalize the meter.
const METER_MAX = 9;

interface Props {
  levelName: string;
  color: string;
  activeStdDrinks: number;
  timeLabel: string;
}

export default function LevelMeter({ levelName, color, activeStdDrinks, timeLabel }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;
  const fill = useRef(new Animated.Value(0)).current;

  // Continuous breathing glow.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Animate the meter fill toward the current value.
  const pct = Math.max(0, Math.min(1, activeStdDrinks / METER_MAX));
  useEffect(() => {
    Animated.timing(fill, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct, fill]);

  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const fillWidth = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.outer}>
      {/* Pulsing halo behind the card, tinted by the level color. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            backgroundColor: withAlpha(color, 0.9),
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      />
      <GlassCard style={styles.card} radius={RADII.xl}>
        <View style={[styles.levelTag, { backgroundColor: withAlpha(color, 0.18), borderColor: color }]}>
          <View style={[styles.levelDot, { backgroundColor: color }]} />
          <Text style={[styles.levelText, { color }]}>{levelName}</Text>
        </View>

        <Text style={styles.number}>{activeStdDrinks.toFixed(2)}</Text>
        <Text style={styles.numberLabel}>active standard drinks</Text>

        <View style={styles.meterTrack}>
          <Animated.View style={[styles.meterFill, { width: fillWidth, backgroundColor: color }]} />
        </View>

        <Text style={styles.sober}>
          <Text style={styles.soberValue}>{timeLabel}</Text> until sober
        </Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { marginBottom: SPACING.xl },
  // Extends beyond the card on all sides so the colored glow reads as a ring
  // around it rather than being hidden behind the opaque glass surface.
  halo: {
    position: 'absolute',
    top: -14,
    left: -14,
    right: -14,
    bottom: -14,
    borderRadius: RADII.xl + 20,
  },
  card: { padding: SPACING.xxl },
  levelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: SPACING.lg,
  },
  levelDot: { width: 8, height: 8, borderRadius: 4, marginRight: 7 },
  levelText: { ...TYPE.body, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  number: {
    ...TYPE.hero,
    color: APP_COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  numberLabel: { ...TYPE.caption, color: APP_COLORS.textSecondary, marginTop: 2 },
  meterTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: withAlpha('#000000', 0.35),
    overflow: 'hidden',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  meterFill: { height: '100%', borderRadius: 5 },
  sober: { ...TYPE.body, color: APP_COLORS.textSecondary, fontWeight: '600' },
  soberValue: { color: APP_COLORS.text, fontWeight: '800' },
});
