// context/AccountData.tsx

import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

// Define the correct type for Ionicons names
type IoniconsName = ComponentProps<typeof Ionicons>['name'];

// Define and export the Account type
export type Account = {
  id: number;
  icon: IoniconsName;
  label: string;
};

// Export the default accounts array using the Account type
export const defaultAccounts: Account[] = [
  { id: 1, icon: 'wallet-outline', label: 'Personal' },
];
