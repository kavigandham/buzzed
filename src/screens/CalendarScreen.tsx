// Monthly drinking history + shareable card.
// Data comes from context.calendarDays. Each day cell is tinted by that day's
// max impairment level. A ViewShot wraps only the shareable portion (branded
// header + grid + legend); the share button / controls sit outside it.

import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import {
  startOfMonth,
  getDaysInMonth,
  getDay,
  getYear,
  getMonth,
  format,
  addMonths,
  subMonths,
} from 'date-fns';

import { useDrink } from '../contexts/DrinkContext';
import { CalendarDay, ImpairmentLevel } from '../types';
import { LEVEL_CONFIGS } from '../constants/levels';
import { LEVEL_COLORS } from '../constants/colors';
import { APP_COLORS } from '../constants/colors';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function levelName(level: ImpairmentLevel): string {
  return LEVEL_CONFIGS.find((c) => c.label === level)?.name ?? level;
}

interface Cell {
  day: number;
  dateStr: string;
}

export default function CalendarScreen() {
  const { calendarDays, profile } = useDrink();
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [showName, setShowName] = useState(false);

  const viewShotRef = useRef<ViewShotRef>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const dayMap = useMemo(() => {
    const map: Record<string, CalendarDay> = {};
    for (const d of calendarDays) map[d.date] = d;
    return map;
  }, [calendarDays]);

  const cells = useMemo<(Cell | null)[]>(() => {
    const monthStart = startOfMonth(currentMonth);
    const year = getYear(currentMonth);
    const month = getMonth(currentMonth);
    const total = getDaysInMonth(currentMonth);
    const leading = getDay(monthStart); // 0 = Sunday

    const out: (Cell | null)[] = [];
    for (let i = 0; i < leading; i++) out.push(null);
    for (let d = 1; d <= total; d++) {
      out.push({ day: d, dateStr: format(new Date(year, month, d), 'yyyy-MM-dd') });
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [currentMonth]);

  const onDayPress = (cell: Cell) => {
    const isFuture = cell.dateStr > todayStr;
    if (isFuture) return; // future days are not interactive
    const data = dayMap[cell.dateStr];
    const pretty = format(new Date(`${cell.dateStr}T00:00:00`), 'EEE, MMM d, yyyy');
    if (!data) {
      Alert.alert(pretty, 'No drinks logged this day.');
      return;
    }
    const breakdown = data.drinks.map((d) => `${d.count} × ${d.name}`).join('\n');
    Alert.alert(
      pretty,
      `Max level: ${levelName(data.maxLevel)}\n` +
        `Total: ${data.totalStandardDrinks.toFixed(2)} standard drinks\n\n` +
        breakdown
    );
  };

  const onShare = async () => {
    try {
      const ref = viewShotRef.current;
      if (!ref || typeof ref.capture !== 'function') return;
      const uri = await ref.capture();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      }
    } catch {
      Alert.alert('Share failed', 'Could not capture the calendar image.');
    }
  };

  const monthLabel = format(currentMonth, 'MMMM yyyy');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top bar (outside the shareable capture) */}
        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>Calendar</Text>
          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Month navigation (outside capture) */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navArrow}
            onPress={() => setCurrentMonth((m) => subMonths(m, 1))}
          >
            <Text style={styles.navArrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.navMonth}>{monthLabel}</Text>
          <TouchableOpacity
            style={styles.navArrow}
            onPress={() => setCurrentMonth((m) => addMonths(m, 1))}
          >
            <Text style={styles.navArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Name toggle (outside capture) */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Show my name on share</Text>
          <Switch
            value={showName}
            onValueChange={setShowName}
            trackColor={{ true: APP_COLORS.accent, false: APP_COLORS.border }}
          />
        </View>

        {/* Shareable portion */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={styles.shot}>
          <Text style={styles.brand}>Buzzed.</Text>
          <Text style={styles.shotMonth}>{monthLabel}</Text>
          {showName && profile.name.trim().length > 0 && (
            <Text style={styles.shotName}>Shared by {profile.name.trim()}</Text>
          )}

          {/* Weekday labels */}
          <View style={styles.weekRow}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={styles.weekday}>
                {w}
              </Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {cells.map((cell, i) => {
              if (!cell) return <View key={`e${i}`} style={styles.cell} />;
              const data = dayMap[cell.dateStr];
              const isToday = cell.dateStr === todayStr;
              const isFuture = cell.dateStr > todayStr;
              const bg = data ? LEVEL_COLORS[data.maxLevel] : APP_COLORS.surface;
              return (
                <TouchableOpacity
                  key={cell.dateStr}
                  style={styles.cell}
                  activeOpacity={isFuture ? 1 : 0.6}
                  disabled={isFuture}
                  onPress={() => onDayPress(cell)}
                >
                  <View
                    style={[
                      styles.cellInner,
                      { backgroundColor: bg },
                      isToday && styles.cellToday,
                      isFuture && styles.cellFuture,
                    ]}
                  >
                    <Text style={[styles.cellDay, data && styles.cellDayOnColor]}>{cell.day}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {LEVEL_CONFIGS.map((c) => (
              <View key={c.label} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: c.color }]} />
                <Text style={styles.legendText}>{c.name}</Text>
              </View>
            ))}
          </View>
        </ViewShot>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  screenTitle: { color: APP_COLORS.text, fontSize: 28, fontWeight: '800' },
  shareButton: {
    backgroundColor: APP_COLORS.accent,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  shareButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: APP_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowText: { color: APP_COLORS.text, fontSize: 26, fontWeight: '700', lineHeight: 28 },
  navMonth: { color: APP_COLORS.text, fontSize: 20, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toggleLabel: { color: APP_COLORS.textSecondary, fontSize: 14 },
  shot: { backgroundColor: APP_COLORS.background, borderRadius: 16, padding: 14 },
  brand: { color: APP_COLORS.text, fontSize: 30, fontWeight: '800' },
  shotMonth: { color: APP_COLORS.textSecondary, fontSize: 16, marginTop: 2, marginBottom: 4 },
  shotName: { color: APP_COLORS.textSecondary, fontSize: 13, marginBottom: 6 },
  weekRow: { flexDirection: 'row', marginTop: 8, marginBottom: 4 },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  cellInner: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellToday: { borderWidth: 2, borderColor: APP_COLORS.text },
  cellFuture: { opacity: 0.4 },
  cellDay: { color: APP_COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  cellDayOnColor: { color: '#FFFFFF' },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  legendSwatch: { width: 14, height: 14, borderRadius: 4, marginRight: 8 },
  legendText: { color: APP_COLORS.textSecondary, fontSize: 13 },
});
