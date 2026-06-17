// ~100 preloaded drinks (static). ABV stored as decimals (0.043 = 4.3%).
// Cocktail ABVs represent the mixed drink's total ABV, not the base spirit.
// IDs are slugified drink names. Colors/levels handled elsewhere.

import { DrinkCategory, LibraryDrink } from '../types';

export const DRINK_LIBRARY: LibraryDrink[] = [
  // ---------------------------------------------------------------- Beer (25)
  { id: 'bud-light', name: 'Bud Light', category: 'beer', abv: 0.042, defaultServingOz: 12, tags: ['domestic', 'light', 'lager'] },
  { id: 'budweiser', name: 'Budweiser', category: 'beer', abv: 0.05, defaultServingOz: 12, tags: ['domestic', 'lager'] },
  { id: 'busch-light', name: 'Busch Light', category: 'beer', abv: 0.043, defaultServingOz: 12, tags: ['domestic', 'light', 'lager'] },
  { id: 'coors-light', name: 'Coors Light', category: 'beer', abv: 0.042, defaultServingOz: 12, tags: ['domestic', 'light', 'lager'] },
  { id: 'miller-lite', name: 'Miller Lite', category: 'beer', abv: 0.042, defaultServingOz: 12, tags: ['domestic', 'light', 'lager'] },
  { id: 'michelob-ultra', name: 'Michelob Ultra', category: 'beer', abv: 0.042, defaultServingOz: 12, tags: ['domestic', 'light', 'low-carb', 'lager'] },
  { id: 'corona-extra', name: 'Corona Extra', category: 'beer', abv: 0.046, defaultServingOz: 12, tags: ['import', 'mexican', 'lager'] },
  { id: 'modelo-especial', name: 'Modelo Especial', category: 'beer', abv: 0.044, defaultServingOz: 12, tags: ['import', 'mexican', 'lager'] },
  { id: 'heineken', name: 'Heineken', category: 'beer', abv: 0.05, defaultServingOz: 12, tags: ['import', 'dutch', 'lager'] },
  { id: 'stella-artois', name: 'Stella Artois', category: 'beer', abv: 0.05, defaultServingOz: 11.2, tags: ['import', 'belgian', 'lager'] },
  { id: 'blue-moon', name: 'Blue Moon', category: 'beer', abv: 0.054, defaultServingOz: 12, tags: ['craft', 'wheat', 'belgian-style'] },
  { id: 'guinness-draught', name: 'Guinness Draught', category: 'beer', abv: 0.042, defaultServingOz: 14.9, tags: ['import', 'irish', 'stout'] },
  { id: 'sierra-nevada-pale-ale', name: 'Sierra Nevada Pale Ale', category: 'beer', abv: 0.056, defaultServingOz: 12, tags: ['craft', 'pale-ale'] },
  { id: 'lagunitas-ipa', name: 'Lagunitas IPA', category: 'beer', abv: 0.062, defaultServingOz: 12, tags: ['craft', 'ipa', 'hoppy'] },
  { id: 'dogfish-head-60-min-ipa', name: 'Dogfish Head 60 Min IPA', category: 'beer', abv: 0.06, defaultServingOz: 12, tags: ['craft', 'ipa', 'hoppy'] },
  { id: 'voodoo-ranger-ipa', name: 'Voodoo Ranger IPA', category: 'beer', abv: 0.07, defaultServingOz: 12, tags: ['craft', 'ipa', 'hoppy'] },
  { id: 'fat-tire', name: 'Fat Tire', category: 'beer', abv: 0.052, defaultServingOz: 12, tags: ['craft', 'amber-ale'] },
  { id: 'pbr', name: 'PBR', category: 'beer', abv: 0.048, defaultServingOz: 12, tags: ['domestic', 'lager', 'cheap'] },
  { id: 'natural-light', name: 'Natural Light', category: 'beer', abv: 0.042, defaultServingOz: 12, tags: ['domestic', 'light', 'lager', 'cheap'] },
  { id: 'keystone-light', name: 'Keystone Light', category: 'beer', abv: 0.041, defaultServingOz: 12, tags: ['domestic', 'light', 'lager', 'cheap'] },
  { id: 'yuengling', name: 'Yuengling', category: 'beer', abv: 0.045, defaultServingOz: 12, tags: ['domestic', 'amber', 'lager'] },
  { id: 'sam-adams-boston-lager', name: 'Sam Adams Boston Lager', category: 'beer', abv: 0.05, defaultServingOz: 12, tags: ['craft', 'lager'] },
  { id: 'dos-equis', name: 'Dos Equis', category: 'beer', abv: 0.042, defaultServingOz: 12, tags: ['import', 'mexican', 'lager'] },
  { id: 'peroni', name: 'Peroni', category: 'beer', abv: 0.051, defaultServingOz: 12, tags: ['import', 'italian', 'lager'] },
  { id: 'sapporo', name: 'Sapporo', category: 'beer', abv: 0.05, defaultServingOz: 12, tags: ['import', 'japanese', 'lager'] },

  // ---------------------------------------------------------------- Wine (12)
  { id: 'red-wine', name: 'Red Wine', category: 'wine', abv: 0.135, defaultServingOz: 5, tags: ['red', 'table'] },
  { id: 'white-wine', name: 'White Wine', category: 'wine', abv: 0.125, defaultServingOz: 5, tags: ['white', 'table'] },
  { id: 'rose', name: 'Rosé', category: 'wine', abv: 0.12, defaultServingOz: 5, tags: ['rose', 'pink'] },
  { id: 'prosecco', name: 'Prosecco', category: 'wine', abv: 0.11, defaultServingOz: 5, tags: ['sparkling', 'italian'] },
  { id: 'champagne', name: 'Champagne', category: 'wine', abv: 0.12, defaultServingOz: 5, tags: ['sparkling', 'french'] },
  { id: 'pinot-noir', name: 'Pinot Noir', category: 'wine', abv: 0.135, defaultServingOz: 5, tags: ['red', 'varietal'] },
  { id: 'cabernet-sauvignon', name: 'Cabernet Sauvignon', category: 'wine', abv: 0.145, defaultServingOz: 5, tags: ['red', 'varietal', 'bold'] },
  { id: 'chardonnay', name: 'Chardonnay', category: 'wine', abv: 0.135, defaultServingOz: 5, tags: ['white', 'varietal'] },
  { id: 'sauvignon-blanc', name: 'Sauvignon Blanc', category: 'wine', abv: 0.125, defaultServingOz: 5, tags: ['white', 'varietal', 'crisp'] },
  { id: 'riesling', name: 'Riesling', category: 'wine', abv: 0.09, defaultServingOz: 5, tags: ['white', 'sweet', 'varietal'] },
  { id: 'merlot', name: 'Merlot', category: 'wine', abv: 0.135, defaultServingOz: 5, tags: ['red', 'varietal'] },
  { id: 'moscato', name: 'Moscato', category: 'wine', abv: 0.055, defaultServingOz: 5, tags: ['white', 'sweet', 'sparkling'] },

  // ------------------------------------------------------------ Cocktail (25)
  { id: 'margarita', name: 'Margarita', category: 'cocktail', abv: 0.13, defaultServingOz: 8, tags: ['tequila', 'sour', 'classic'] },
  { id: 'espresso-martini', name: 'Espresso Martini', category: 'cocktail', abv: 0.15, defaultServingOz: 6, tags: ['vodka', 'coffee', 'martini'] },
  { id: 'old-fashioned', name: 'Old Fashioned', category: 'cocktail', abv: 0.32, defaultServingOz: 4, tags: ['whiskey', 'bourbon', 'classic'] },
  { id: 'moscow-mule', name: 'Moscow Mule', category: 'cocktail', abv: 0.10, defaultServingOz: 10, tags: ['vodka', 'ginger', 'mule'] },
  { id: 'vodka-soda', name: 'Vodka Soda', category: 'cocktail', abv: 0.12, defaultServingOz: 8, tags: ['vodka', 'light', 'simple'] },
  { id: 'gin-tonic', name: 'Gin & Tonic', category: 'cocktail', abv: 0.10, defaultServingOz: 10, tags: ['gin', 'tonic', 'classic'] },
  { id: 'long-island-iced-tea', name: 'Long Island Iced Tea', category: 'cocktail', abv: 0.22, defaultServingOz: 8, tags: ['strong', 'mixed', 'classic'] },
  { id: 'mai-tai', name: 'Mai Tai', category: 'cocktail', abv: 0.13, defaultServingOz: 8, tags: ['rum', 'tiki', 'tropical'] },
  { id: 'pina-colada', name: 'Piña Colada', category: 'cocktail', abv: 0.10, defaultServingOz: 9, tags: ['rum', 'tropical', 'creamy'] },
  { id: 'mojito', name: 'Mojito', category: 'cocktail', abv: 0.10, defaultServingOz: 10, tags: ['rum', 'mint', 'refreshing'] },
  { id: 'cosmopolitan', name: 'Cosmopolitan', category: 'cocktail', abv: 0.17, defaultServingOz: 5, tags: ['vodka', 'cranberry', 'martini'] },
  { id: 'manhattan', name: 'Manhattan', category: 'cocktail', abv: 0.28, defaultServingOz: 4, tags: ['whiskey', 'vermouth', 'classic'] },
  { id: 'negroni', name: 'Negroni', category: 'cocktail', abv: 0.24, defaultServingOz: 4, tags: ['gin', 'campari', 'bitter'] },
  { id: 'whiskey-sour', name: 'Whiskey Sour', category: 'cocktail', abv: 0.15, defaultServingOz: 6, tags: ['whiskey', 'sour', 'classic'] },
  { id: 'aperol-spritz', name: 'Aperol Spritz', category: 'cocktail', abv: 0.08, defaultServingOz: 8, tags: ['aperol', 'sparkling', 'light'] },
  { id: 'paloma', name: 'Paloma', category: 'cocktail', abv: 0.10, defaultServingOz: 10, tags: ['tequila', 'grapefruit', 'refreshing'] },
  { id: 'dark-stormy', name: 'Dark & Stormy', category: 'cocktail', abv: 0.10, defaultServingOz: 10, tags: ['rum', 'ginger', 'classic'] },
  { id: 'daiquiri', name: 'Daiquiri', category: 'cocktail', abv: 0.14, defaultServingOz: 6, tags: ['rum', 'sour', 'classic'] },
  { id: 'tom-collins', name: 'Tom Collins', category: 'cocktail', abv: 0.10, defaultServingOz: 10, tags: ['gin', 'sour', 'refreshing'] },
  { id: 'rum-coke', name: 'Rum & Coke', category: 'cocktail', abv: 0.10, defaultServingOz: 10, tags: ['rum', 'cola', 'simple'] },
  { id: 'vodka-cranberry', name: 'Vodka Cranberry', category: 'cocktail', abv: 0.10, defaultServingOz: 8, tags: ['vodka', 'cranberry', 'simple'] },
  { id: 'screwdriver', name: 'Screwdriver', category: 'cocktail', abv: 0.10, defaultServingOz: 8, tags: ['vodka', 'orange', 'simple'] },
  { id: 'tequila-sunrise', name: 'Tequila Sunrise', category: 'cocktail', abv: 0.10, defaultServingOz: 9, tags: ['tequila', 'orange', 'sweet'] },
  { id: 'white-russian', name: 'White Russian', category: 'cocktail', abv: 0.15, defaultServingOz: 6, tags: ['vodka', 'coffee', 'creamy'] },
  { id: 'jungle-juice', name: 'Jungle Juice', category: 'cocktail', abv: 0.10, defaultServingOz: 12, tags: ['party', 'punch', 'mixed'] },

  // -------------------------------------------------------------- Spirit (12)
  { id: 'vodka', name: 'Vodka', category: 'spirit', abv: 0.40, defaultServingOz: 1.5, tags: ['neat', 'clear', 'base'] },
  { id: 'gin', name: 'Gin', category: 'spirit', abv: 0.40, defaultServingOz: 1.5, tags: ['neat', 'botanical', 'base'] },
  { id: 'rum', name: 'Rum', category: 'spirit', abv: 0.40, defaultServingOz: 1.5, tags: ['neat', 'base'] },
  { id: 'tequila', name: 'Tequila', category: 'spirit', abv: 0.40, defaultServingOz: 1.5, tags: ['neat', 'agave', 'base'] },
  { id: 'bourbon', name: 'Bourbon', category: 'spirit', abv: 0.45, defaultServingOz: 1.5, tags: ['whiskey', 'american', 'neat'] },
  { id: 'scotch', name: 'Scotch', category: 'spirit', abv: 0.43, defaultServingOz: 1.5, tags: ['whisky', 'scottish', 'neat'] },
  { id: 'irish-whiskey', name: 'Irish Whiskey', category: 'spirit', abv: 0.40, defaultServingOz: 1.5, tags: ['whiskey', 'irish', 'neat'] },
  { id: 'rye-whiskey', name: 'Rye Whiskey', category: 'spirit', abv: 0.45, defaultServingOz: 1.5, tags: ['whiskey', 'rye', 'neat'] },
  { id: 'mezcal', name: 'Mezcal', category: 'spirit', abv: 0.42, defaultServingOz: 1.5, tags: ['agave', 'smoky', 'neat'] },
  { id: 'brandy', name: 'Brandy', category: 'spirit', abv: 0.40, defaultServingOz: 1.5, tags: ['neat', 'grape'] },
  { id: 'cognac', name: 'Cognac', category: 'spirit', abv: 0.40, defaultServingOz: 1.5, tags: ['brandy', 'french', 'neat'] },
  { id: 'sake', name: 'Sake', category: 'spirit', abv: 0.16, defaultServingOz: 6, tags: ['rice', 'japanese', 'wine'] },

  // ---------------------------------------------------------------- Shot (10)
  { id: 'fireball', name: 'Fireball', category: 'shot', abv: 0.33, defaultServingOz: 1.5, tags: ['cinnamon', 'whiskey', 'sweet'] },
  { id: 'jagermeister', name: 'Jägermeister', category: 'shot', abv: 0.35, defaultServingOz: 1.5, tags: ['herbal', 'digestif'] },
  { id: 'tequila-shot', name: 'Tequila Shot', category: 'shot', abv: 0.40, defaultServingOz: 1.5, tags: ['tequila', 'shot'] },
  { id: 'vodka-shot', name: 'Vodka Shot', category: 'shot', abv: 0.40, defaultServingOz: 1.5, tags: ['vodka', 'shot'] },
  { id: 'whiskey-shot', name: 'Whiskey Shot', category: 'shot', abv: 0.40, defaultServingOz: 1.5, tags: ['whiskey', 'shot'] },
  { id: 'kamikaze', name: 'Kamikaze', category: 'shot', abv: 0.26, defaultServingOz: 2, tags: ['vodka', 'citrus', 'shooter'] },
  { id: 'lemon-drop', name: 'Lemon Drop', category: 'shot', abv: 0.24, defaultServingOz: 2, tags: ['vodka', 'lemon', 'sweet', 'shooter'] },
  { id: 'b-52', name: 'B-52', category: 'shot', abv: 0.20, defaultServingOz: 2, tags: ['layered', 'coffee', 'shooter'] },
  { id: 'rumple-minze', name: 'Rumple Minze', category: 'shot', abv: 0.50, defaultServingOz: 1.5, tags: ['peppermint', 'strong'] },
  { id: 'pickle-back', name: 'Pickle Back', category: 'shot', abv: 0.40, defaultServingOz: 1.5, tags: ['whiskey', 'pickle', 'chaser'] },

  // ------------------------------------------------- Hard Seltzer / Cider (10)
  { id: 'white-claw', name: 'White Claw', category: 'hard_seltzer', abv: 0.05, defaultServingOz: 12, tags: ['seltzer', 'light', 'fruity'] },
  { id: 'truly', name: 'Truly', category: 'hard_seltzer', abv: 0.05, defaultServingOz: 12, tags: ['seltzer', 'light', 'fruity'] },
  { id: 'high-noon', name: 'High Noon', category: 'hard_seltzer', abv: 0.045, defaultServingOz: 12, tags: ['seltzer', 'vodka', 'fruity'] },
  { id: 'bud-light-seltzer', name: 'Bud Light Seltzer', category: 'hard_seltzer', abv: 0.05, defaultServingOz: 12, tags: ['seltzer', 'light', 'fruity'] },
  { id: 'vizzy', name: 'Vizzy', category: 'hard_seltzer', abv: 0.05, defaultServingOz: 12, tags: ['seltzer', 'light', 'fruity'] },
  { id: 'angry-orchard', name: 'Angry Orchard', category: 'cider', abv: 0.05, defaultServingOz: 12, tags: ['cider', 'apple', 'sweet'] },
  { id: 'austin-eastciders', name: 'Austin Eastciders', category: 'cider', abv: 0.05, defaultServingOz: 12, tags: ['cider', 'apple', 'dry'] },
  { id: 'strongbow', name: 'Strongbow', category: 'cider', abv: 0.05, defaultServingOz: 11.2, tags: ['cider', 'apple', 'import'] },
  { id: 'woodchuck', name: 'Woodchuck', category: 'cider', abv: 0.05, defaultServingOz: 12, tags: ['cider', 'apple'] },
  { id: 'mikes-hard-lemonade', name: "Mike's Hard Lemonade", category: 'malt_beverage', abv: 0.05, defaultServingOz: 11.2, tags: ['lemonade', 'sweet', 'malt'] },

  // ---------------------------------------------------------- Malt / Mixed (6)
  { id: 'smirnoff-ice', name: 'Smirnoff Ice', category: 'malt_beverage', abv: 0.045, defaultServingOz: 11.2, tags: ['malt', 'citrus', 'sweet'] },
  { id: 'four-loko', name: 'Four Loko', category: 'malt_beverage', abv: 0.12, defaultServingOz: 23.5, tags: ['malt', 'strong', 'party'] },
  { id: 'twisted-tea', name: 'Twisted Tea', category: 'malt_beverage', abv: 0.05, defaultServingOz: 12, tags: ['malt', 'tea', 'sweet'] },
  { id: 'not-your-fathers-root-beer', name: "Not Your Father's Root Beer", category: 'malt_beverage', abv: 0.059, defaultServingOz: 12, tags: ['malt', 'root-beer', 'sweet'] },
  { id: 'redbull-vodka', name: 'Redbull Vodka', category: 'cocktail', abv: 0.10, defaultServingOz: 12, tags: ['vodka', 'energy', 'party'] },
  { id: 'ranch-water', name: 'Ranch Water', category: 'cocktail', abv: 0.045, defaultServingOz: 12, tags: ['tequila', 'seltzer', 'refreshing'] },
];

export function getDrinkById(id: string): LibraryDrink | undefined {
  return DRINK_LIBRARY.find((drink) => drink.id === id);
}

export function getDrinksByCategory(category: DrinkCategory): LibraryDrink[] {
  return DRINK_LIBRARY.filter((drink) => drink.category === category);
}

export function searchDrinks(query: string): LibraryDrink[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DRINK_LIBRARY.filter(
    (drink) =>
      drink.name.toLowerCase().includes(q) ||
      drink.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}
