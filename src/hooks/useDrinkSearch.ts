// Shared search/filter logic for the drink catalog (used by both the
// DrinkSelectionModal and the Library screen). Debounced, case-insensitive
// search over name + tags, combined with category filtering using AND logic.

import { useEffect, useMemo, useState } from 'react';
import {
  DRINK_LIBRARY,
  getDrinkById,
  getDrinksByCategory,
  searchDrinks,
} from '../data/drinkLibrary';
import { DrinkCategory, LibraryDrink } from '../types';

export type CategoryFilter = 'all' | DrinkCategory;

export const CATEGORY_PILLS: { label: string; value: CategoryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Beer', value: 'beer' },
  { label: 'Wine', value: 'wine' },
  { label: 'Cocktail', value: 'cocktail' },
  { label: 'Spirit', value: 'spirit' },
  { label: 'Shot', value: 'shot' },
  { label: 'Seltzer', value: 'hard_seltzer' },
  { label: 'Cider', value: 'cider' },
  { label: 'Malt', value: 'malt_beverage' },
  { label: 'Other', value: 'other' },
];

export interface UseDrinkSearch {
  searchInput: string;
  setSearchInput: (value: string) => void;
  debouncedQuery: string;
  category: CategoryFilter;
  setCategory: (value: CategoryFilter) => void;
  drinks: LibraryDrink[];
  totalCount: number;
  reset: () => void;
}

export function useDrinkSearch(customDrinks: LibraryDrink[]): UseDrinkSearch {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  // Debounce the search input by 300ms.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(searchInput), 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const drinks = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const base: LibraryDrink[] =
      category === 'all'
        ? [...DRINK_LIBRARY, ...customDrinks]
        : [
            ...getDrinksByCategory(category),
            ...customDrinks.filter((d) => d.category === category),
          ];

    if (!q) return base;

    const matchedIds = new Set(searchDrinks(q).map((d) => d.id));
    return base.filter((d) =>
      getDrinkById(d.id)
        ? matchedIds.has(d.id) // library item — use searchDrinks result
        : d.name.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)) // custom item
    );
  }, [debouncedQuery, category, customDrinks]);

  const totalCount = DRINK_LIBRARY.length + customDrinks.length;

  const reset = () => {
    setSearchInput('');
    setDebouncedQuery('');
    setCategory('all');
  };

  return {
    searchInput,
    setSearchInput,
    debouncedQuery,
    category,
    setCategory,
    drinks,
    totalCount,
    reset,
  };
}
