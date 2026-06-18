// Personal drink history. Shows only drinks the user has consumed at least
// once (context.cabinet). Tap = quick-log default serving; long-press = detail
// modal with serving override; star = toggle favorite (persisted via context).

import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useDrink } from '../contexts/DrinkContext';
import { CabinetEntry } from '../types';
import { APP_COLORS, CATEGORY_COLORS } from '../constants/colors';
import { RADII, SPACING, withAlpha } from '../constants/theme';
import DrinkDetailModal, { DetailDrink } from '../components/DrinkDetailModal';
import AnimatedGradientBackground from '../components/ui/AnimatedGradientBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import Pill from '../components/ui/Pill';
import PressableScale from '../components/ui/PressableScale';

type SortMode = 'favorites' | 'most' | 'recent' | 'az';

const SORTS: { key: SortMode; label: string }[] = [
  { key: 'favorites', label: 'Favorites' },
  { key: 'most', label: 'Most consumed' },
  { key: 'recent', label: 'Recent' },
  { key: 'az', label: 'A-Z' },
];

function sortCabinet(entries: CabinetEntry[], mode: SortMode): CabinetEntry[] {
  const copy = [...entries];
  switch (mode) {
    case 'most':
      return copy.sort((a, b) => b.totalCount - a.totalCount);
    case 'recent':
      return copy.sort((a, b) => b.lastConsumed - a.lastConsumed);
    case 'az':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'favorites':
    default:
      return copy.sort((a, b) => {
        if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
        return b.totalCount - a.totalCount;
      });
  }
}

export default function MyCabinetScreen() {
  const { cabinet, logDrink, toggleFavorite } = useDrink();
  const [sortMode, setSortMode] = useState<SortMode>('favorites');
  const [detail, setDetail] = useState<DetailDrink | null>(null);

  const sorted = useMemo(() => sortCabinet(cabinet, sortMode), [cabinet, sortMode]);

  const openDetail = (entry: CabinetEntry) =>
    setDetail({
      id: entry.drinkId,
      name: entry.name,
      category: entry.category,
      abv: entry.abv,
      defaultServingOz: entry.defaultServingOz,
    });

  const renderItem = ({ item }: { item: CabinetEntry }) => (
    <PressableScale
      onPress={() => logDrink(item.drinkId)}
      onLongPress={() => openDetail(item)}
      style={styles.cardWrap}
    >
      <View style={styles.card}>
        <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[item.category] }]} />
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardMeta}>
            {(item.abv * 100).toFixed(1)}% · ×{item.totalCount}
            {item.lastConsumed > 0 ? ` · ${format(new Date(item.lastConsumed), 'MMM d')}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.star}
          onPress={() => toggleFavorite(item.drinkId)}
          hitSlop={10}
        >
          <Ionicons
            name={item.favorite ? 'star' : 'star-outline'}
            size={24}
            color={item.favorite ? '#E6B800' : APP_COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </PressableScale>
  );

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScreenHeader title="Cabinet" />

        {cabinet.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.empty}>
              No drinks logged yet. Start by logging your first drink!
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.count}>
              {cabinet.length} {cabinet.length === 1 ? 'drink' : 'drinks'} in your cabinet
            </Text>

            {/* Sort selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.segmentScroll}
              contentContainerStyle={styles.segment}
            >
              {SORTS.map((s) => (
                <Pill
                  key={s.key}
                  label={s.label}
                  active={s.key === sortMode}
                  onPress={() => setSortMode(s.key)}
                  style={styles.segmentSpacing}
                />
              ))}
            </ScrollView>

            <FlatList
              data={sorted}
              keyExtractor={(item) => item.drinkId}
              renderItem={renderItem}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          </>
        )}

        <DrinkDetailModal drink={detail} onClose={() => setDetail(null)} onLog={logDrink} />
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.lg },
  count: { color: APP_COLORS.textSecondary, fontSize: 14, marginBottom: SPACING.md },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xxl },
  empty: { color: APP_COLORS.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  segmentScroll: { flexGrow: 0, marginBottom: SPACING.md },
  segment: { flexDirection: 'row', paddingRight: SPACING.sm },
  segmentSpacing: { marginRight: SPACING.sm },
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
  star: { paddingLeft: 12, paddingVertical: 4 },
});
