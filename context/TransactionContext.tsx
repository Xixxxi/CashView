// context/TransactionContext.tsx
import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

export type Transaction = {
  id: number;
  type: 'income' | 'expense';
  amount: string;
  category: string;
  date: string;
  account: string;
  repeating: string;
  notes: string;
  currency?: string;
  originalId?: number;
};

type TransactionContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: number) => void;
  updateTransaction: (id: number, updatedFields: Partial<Transaction>) => void; // New method
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
};

export const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const useTransactionContext = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
};

const TRANSACTION_STORAGE_KEY = '@transactions';

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions from AsyncStorage when the app initializes
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem(
          TRANSACTION_STORAGE_KEY
        );
        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions));
        }
      } catch (error) {
        console.error('Failed to load transactions from storage', error);
      }
    };

    loadTransactions();
  }, []);

  // Save transactions to AsyncStorage whenever they change
  useEffect(() => {
    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem(
          TRANSACTION_STORAGE_KEY,
          JSON.stringify(transactions)
        );
      } catch (error) {
        console.error('Failed to save transactions to storage', error);
      }
    };

    saveTransactions();
  }, [transactions]);

  const generateFutureTransactions = (transaction: Transaction): Transaction[] => {
    const futureTransactions: Transaction[] = [];
    const repeatInterval =
      transaction.repeating === 'Monthly'
        ? 1
        : transaction.repeating === 'Quarterly'
        ? 3
        : transaction.repeating === 'Annually'
        ? 12
        : 0; // No repeating

    if (repeatInterval === 0) {
      return [];
    }

    const startDate = moment(transaction.date, 'DD MMMM YYYY');
    const endDate = moment().add(1, 'year'); // Generate transactions up to one year ahead
    let nextDate = startDate.clone().add(repeatInterval, 'months');

    while (nextDate.isBefore(endDate)) {
      const newTransaction: Transaction = {
        ...transaction,
        id: Math.floor(Math.random() * 1000000), // Generate a unique id
        date: nextDate.format('DD MMMM YYYY'),
        originalId: transaction.id, // Link to the original transaction
      };
      futureTransactions.push(newTransaction);
      nextDate.add(repeatInterval, 'months');
    }

    return futureTransactions;
  };

  const addTransaction = (transaction: Transaction) => {
    const futureTransactions = generateFutureTransactions(transaction);
    setTransactions((prevTransactions) => [
      ...prevTransactions,
      transaction,
      ...futureTransactions,
    ]);
    // No need to call saveTransactions here since useEffect handles it
  };

  const removeTransaction = (id: number) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter(
        (t) => t.id !== id && t.originalId !== id // Remove all linked transactions
      )
    );
    // No need to call saveTransactions here since useEffect handles it
  };

  // New method to update a transaction
  const updateTransaction = (id: number, updatedFields: Partial<Transaction>) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === id ? { ...transaction, ...updatedFields } : transaction
      )
    );
  };

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, removeTransaction, updateTransaction, setTransactions }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
