// context/CategoryData.ts
import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

// Define the correct type for Ionicons names
type IoniconsName = ComponentProps<typeof Ionicons>['name'];

// Define and export the Category type
export type Category = {
  id: number;
  icon: IoniconsName;
  label: string;
};

// Export the categories array using the Category type
export const categories: Category[] = [
  { id: 1, icon: 'cash-outline', label: 'Gehälter' },
  { id: 2, icon: 'cart-outline', label: 'Lebensmittel' },
  { id: 3, icon: 'car-outline', label: 'Gas' },
  { id: 4, icon: 'home-outline', label: 'Miete' },
  { id: 5, icon: 'barbell-outline', label: 'Fitnessstudio' },
  { id: 6, icon: 'restaurant-outline', label: 'Restaurant' },
  { id: 7, icon: 'airplane-outline', label: 'Urlaub' },
  { id: 8, icon: 'bus-outline', label: 'Reisen' },
  { id: 9, icon: 'gift-outline', label: 'Geschenk' },
  { id: 10, icon: 'trending-up-outline', label: 'Investitionen' },
  { id: 11, icon: 'wallet-outline', label: 'Ersparnisse' },
  { id: 12, icon: 'tv-outline', label: 'Unterhaltung' },
  { id: 13, icon: 'cafe-outline', label: 'Kaffee' },
  { id: 14, icon: 'wifi-outline', label: 'Internet' },
  { id: 15, icon: 'car-outline', label: 'Taxi' },
];
