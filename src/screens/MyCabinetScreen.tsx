// Personal drink history. Shows only drinks the user has consumed at least
// once (context.cabinet). Tap = quick-log default serving; long-press = detail
// modal with serving override; star = toggle favorite (persisted via context).

import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useDrink } from '../contexts/DrinkContext';
import { CabinetEntry } from '../types';
import { APP_COLORS, CATEGORY_COLORS } from '../constants/colors';
import DrinkDetailModal, { DetailDrink } from '../components/DrinkDetailModal';

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
    <TouchableOpacity
      style={styles.card}
      onPress={() => logDrink(item.drinkId)}
      onLongPress={() => openDetail(item)}
    >
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Cabinet</Text>

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

          {/* Sort selector (segmented control) */}
          <View style={styles.segment}>
            {SORTS.map((s) => {
              const active = s.key === sortMode;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.segmentItem, active && styles.segmentItemActive]}
                  onPress={() => setSortMode(s.key)}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background, paddingHorizontal: 16 },
  title: { color: APP_COLORS.text, fontSize: 28, fontWeight: '800', marginTop: 8, marginBottom: 12 },
  count: { color: APP_COLORS.textSecondary, fontSize: 14, marginBottom: 12 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  empty: { color: APP_COLORS.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  segment: {
    flexDirection: 'row',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    padding: 4,
    marginBottom: 12,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentItemActive: { backgroundColor: APP_COLORS.accent },
  segmentText: { color: APP_COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  segmentTextActive: { color: '#FFFFFF' },
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
  star: { paddingLeft: 12, paddingVertical: 4 },
});
