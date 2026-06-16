import type { Card, Set } from './types'

export const mockSets: Set[] = [
  {
    id: 'sv151',
    name: 'Scarlet & Violet — 151',
    release_date: '2023-09-22',
    total: 165,
    images: { logo: 'https://images.pokemontcg.io/sv3pt5/logo.png' },
  },
  {
    id: 'sv4',
    name: 'Paradox Rift',
    release_date: '2023-11-03',
    total: 182,
    images: { logo: 'https://images.pokemontcg.io/sv4/logo.png' },
  },
  {
    id: 'sv3',
    name: 'Obsidian Flames',
    release_date: '2023-08-11',
    total: 197,
    images: { logo: 'https://images.pokemontcg.io/sv3/logo.png' },
  },
  {
    id: 'sv2',
    name: 'Paldea Evolved',
    release_date: '2023-06-09',
    total: 193,
    images: { logo: 'https://images.pokemontcg.io/sv2/logo.png' },
  },
]

export const mockCards: Card[] = [
  {
    id: 'sv151-006',
    name: 'Charizard ex',
    number: '006/165',
    rarity: 'Double Rare',
    images: {
      small: 'https://images.pokemontcg.io/sv3pt5/6.png',
      large: 'https://images.pokemontcg.io/sv3pt5/6_hires.png',
    },
    set_id: 'sv151',
    set_name: 'Scarlet & Violet — 151',
  },
  {
    id: 'sv151-025',
    name: 'Pikachu',
    number: '025/165',
    rarity: 'Common',
    images: {
      small: 'https://images.pokemontcg.io/sv3pt5/25.png',
      large: 'https://images.pokemontcg.io/sv3pt5/25_hires.png',
    },
    set_id: 'sv151',
    set_name: 'Scarlet & Violet — 151',
  },
  {
    id: 'sv151-130',
    name: 'Mew ex',
    number: '130/165',
    rarity: 'Double Rare',
    images: {
      small: 'https://images.pokemontcg.io/sv3pt5/130.png',
      large: 'https://images.pokemontcg.io/sv3pt5/130_hires.png',
    },
    set_id: 'sv151',
    set_name: 'Scarlet & Violet — 151',
  },
  {
    id: 'sv151-173',
    name: 'Charizard ex',
    number: '173/165',
    rarity: 'Ultra Rare',
    images: {
      small: 'https://images.pokemontcg.io/sv3pt5/173.png',
      large: 'https://images.pokemontcg.io/sv3pt5/173_hires.png',
    },
    set_id: 'sv151',
    set_name: 'Scarlet & Violet — 151',
  },
  {
    id: 'sv4-125',
    name: 'Garchomp ex',
    number: '125/182',
    rarity: 'Double Rare',
    images: {
      small: 'https://images.pokemontcg.io/sv4/125.png',
      large: 'https://images.pokemontcg.io/sv4/125_hires.png',
    },
    set_id: 'sv4',
    set_name: 'Paradox Rift',
  },
  {
    id: 'sv4-164',
    name: 'Iron Valiant ex',
    number: '164/182',
    rarity: 'Double Rare',
    images: {
      small: 'https://images.pokemontcg.io/sv4/164.png',
      large: 'https://images.pokemontcg.io/sv4/164_hires.png',
    },
    set_id: 'sv4',
    set_name: 'Paradox Rift',
  },
  {
    id: 'sv3-125',
    name: 'Charizard ex',
    number: '125/197',
    rarity: 'Double Rare',
    images: {
      small: 'https://images.pokemontcg.io/sv3/125.png',
      large: 'https://images.pokemontcg.io/sv3/125_hires.png',
    },
    set_id: 'sv3',
    set_name: 'Obsidian Flames',
  },
  {
    id: 'sv2-193',
    name: 'Iono',
    number: '193/193',
    rarity: 'Special Illustration Rare',
    images: {
      small: 'https://images.pokemontcg.io/sv2/193.png',
      large: 'https://images.pokemontcg.io/sv2/193_hires.png',
    },
    set_id: 'sv2',
    set_name: 'Paldea Evolved',
  },
]
