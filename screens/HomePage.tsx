// HomePage.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from '@react-navigation/native';
import { useTransactionContext, Transaction } from '../context/TransactionContext';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { Category, categories as defaultCategories } from '../context/CategoryData';
import TransactionDetailModal from '../components/TransactionDetailModal';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORY_STORAGE_KEY = '@categories';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const exchangeRates: { [key: string]: number } = {
  'USD': 1.00,
  'EUR': 0.92,
  'GBP': 0.77,
  'JPY': 156.93,
  'INR': 83.97,
  'RUB': 88.31,
  'MXN': 19.17,
  'CHF': 0.89,
  'CNY': 7.09,
  'SEK': 10.18,
  'NZD': 1.49,
  'KRW': 1363.94,
  'BRL': 5.04,
  'ZAR': 18.95,
};

const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'INR': '₹',
  'RUB': '₽',
  'MXN': 'MX$',
  'CHF': 'CHF',
  'CNY': '¥',
  'SEK': 'kr',
  'NZD': 'NZ$',
  'KRW': '₩',
  'BRL': 'R$',
  'ZAR': 'R',
};

const HomePage: React.FC = () => {
  const { transactions, removeTransaction } = useTransactionContext();
  const navigation = useNavigation<NavigationProp<any>>();

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [defaultCurrencyCode, setDefaultCurrencyCode] = useState<string>('EUR');
  const [categories, setCategories] = useState<Category[]>([]);

  const getCurrencyCodeFromSymbol = (symbol: string): string | undefined => {
    return Object.keys(currencySymbols).find((key) => currencySymbols[key] === symbol);
  };

  const getCurrencySymbol = (code: string): string => {
    return currencySymbols[code] || code;
  };

  // Function to load categories from AsyncStorage
  const loadCategories = async () => {
    try {
      const savedCategories = await AsyncStorage.getItem(CATEGORY_STORAGE_KEY);
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else {
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('Failed to load categories from storage:', error);
      setCategories(defaultCategories);
    }
  };

  // Reload categories every time the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
      // Also load default currency
      const loadDefaultCurrency = async () => {
        try {
          const currencySymbol = await AsyncStorage.getItem('@default_currency');
          if (currencySymbol) {
            const currencyCode = getCurrencyCodeFromSymbol(currencySymbol);
            if (currencyCode) {
              setDefaultCurrencyCode(currencyCode);
            } else {
              setDefaultCurrencyCode('EUR');
            }
          } else {
            setDefaultCurrencyCode('EUR');
          }
        } catch (error) {
          console.error('Failed to load default currency:', error);
        }
      };
      loadDefaultCurrency();
    }, [])
  );

  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number => {
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];

    if (fromRate === undefined || toRate === undefined) {
      return amount;
    }

    const amountInBaseCurrency = amount / fromRate;
    const convertedAmount = amountInBaseCurrency * toRate;
    return convertedAmount;
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = moment(transaction.date, 'DD MMMM YYYY');
    return (
      transactionDate.year() === selectedYear &&
      transactionDate.month() === selectedMonth
    );
  });

  const incomeTransactions = filteredTransactions.filter(
    (t: Transaction) => t.type === 'income'
  );
  const expenseTransactions = filteredTransactions.filter(
    (t: Transaction) => t.type === 'expense'
  );

  const incomeTotal = incomeTransactions.reduce((sum: number, t: Transaction) => {
    const amount = parseFloat(t.amount);
    const currencySymbol = t.currency || getCurrencySymbol(defaultCurrencyCode);
    const currencyCode = getCurrencyCodeFromSymbol(currencySymbol) || defaultCurrencyCode;
    const convertedAmount = convertCurrency(amount, currencyCode, defaultCurrencyCode);
    return sum + convertedAmount;
  }, 0);

  const expenseTotal = expenseTransactions.reduce((sum: number, t: Transaction) => {
    const amount = parseFloat(t.amount);
    const currencySymbol = t.currency || getCurrencySymbol(defaultCurrencyCode);
    const currencyCode = getCurrencyCodeFromSymbol(currencySymbol) || defaultCurrencyCode;
    const convertedAmount = convertCurrency(amount, currencyCode, defaultCurrencyCode);
    return sum + convertedAmount;
  }, 0);

  const balance = incomeTotal - expenseTotal;

  let progressBarColor = '#BDBDBD';
  let expenseRatio = 0;
  let incomeRatio = 0;

  if (incomeTotal > 0) {
    if (expenseTotal > incomeTotal) {
      expenseRatio = 1;
      incomeRatio = 0;
    } else {
      expenseRatio = expenseTotal / incomeTotal;
      incomeRatio = 1 - expenseRatio;
    }
    progressBarColor = '#4CAF50';
  } else if (expenseTotal > 0 && incomeTotal === 0) {
    progressBarColor = '#F44336';
    expenseRatio = 1;
  }

  const handleYearChange = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setSelectedYear((prevYear) => prevYear - 1);
    } else {
      setSelectedYear((prevYear) => prevYear + 1);
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setIsModalVisible(false);
  };

  const openTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeTransactionDetails = () => {
    setSelectedTransaction(null);
  };

  const openSettings = () => {
    setIsMenuVisible(false);
    navigation.navigate('Settings');
  };

  const openTransactions = () => {
    setIsMenuVisible(false);
    navigation.navigate('TransactionOverview');
  };

  const toggleProgressBar = () => {
    setShowProgressBar((prev) => !prev);
    setIsMenuVisible(false);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeTransaction(transaction.id),
        },
      ]
    );
  };

  // Function to get the category icon
  const getCategoryIcon = (categoryLabel: string): IoniconsName => {
    const foundCategory = categories.find((cat) => cat.label === categoryLabel);
    return foundCategory ? (foundCategory.icon as IoniconsName) : 'help-outline';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.monthSelector}>
          <Text style={styles.monthText}>
            {months[selectedMonth]} {selectedYear}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical-outline" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Summary Section */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={styles.summaryValue}>
              {balance.toFixed(2)} {getCurrencySymbol(defaultCurrencyCode)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryValue}>
              {incomeTotal.toFixed(2)} {getCurrencySymbol(defaultCurrencyCode)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryValue}>
              {expenseTotal.toFixed(2)} {getCurrencySymbol(defaultCurrencyCode)}
            </Text>
          </View>
        </View>

        {showProgressBar && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarSection,
                {
                  backgroundColor: progressBarColor,
                  flex: incomeTotal > 0 ? incomeRatio : 1,
                },
              ]}
            />
            {incomeTotal > 0 && (
              <View
                style={[
                  styles.progressBarSection,
                  {
                    backgroundColor: '#F44336',
                    flex: expenseRatio,
                  },
                ]}
              />
            )}
          </View>
        )}

        <Text style={styles.savingText}>
          {expenseTotal > incomeTotal
            ? `Expenses exceed income by ${(expenseTotal - incomeTotal).toFixed(
                2
              )} ${getCurrencySymbol(defaultCurrencyCode)}`
            : `${(expenseRatio * 100).toFixed(2)}% of your income spent`}
        </Text>
      </View>

      {/* Income Section */}
      <View style={styles.transactionSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Income</Text>
        </View>
        {incomeTransactions.map((transaction: Transaction) => (
          <TouchableOpacity
            key={transaction.id}
            style={styles.transactionCard}
            onPress={() => openTransactionDetails(transaction)}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#4CAF50' }]}>
              <Ionicons
                name={getCategoryIcon(transaction.category)}
                size={20}
                color="#FFF"
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionCategory}>{transaction.category}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <View style={styles.transactionAmountContainer}>
              <Text style={styles.transactionAmount}>
                +{transaction.amount} {transaction.currency || getCurrencySymbol(defaultCurrencyCode)}
              </Text>
              <TouchableOpacity onPress={() => handleDeleteTransaction(transaction)}>
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        {incomeTransactions.length === 0 && (
          <Text style={styles.placeholderText}>
            No income transactions for this month.
          </Text>
        )}
      </View>

      {/* Expense Section */}
      <View style={styles.transactionSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expenses</Text>
        </View>
        {expenseTransactions.map((transaction: Transaction) => (
          <TouchableOpacity
            key={transaction.id}
            style={styles.transactionCard}
            onPress={() => openTransactionDetails(transaction)}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F44336' }]}>
              <Ionicons
                name={getCategoryIcon(transaction.category)}
                size={20}
                color="#FFF"
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionCategory}>{transaction.category}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <View style={styles.transactionAmountContainer}>
              <Text style={styles.transactionAmount}>
                -{transaction.amount} {transaction.currency || getCurrencySymbol(defaultCurrencyCode)}
              </Text>
              <TouchableOpacity onPress={() => handleDeleteTransaction(transaction)}>
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        {expenseTransactions.length === 0 && (
          <Text style={styles.placeholderText}>
            No expense transactions for this month.
          </Text>
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Ionicons name="add-outline" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Calendar Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.calendarWrapper}>
            <View style={styles.yearNavigation}>
              <TouchableOpacity onPress={() => handleYearChange('left')}>
                <Ionicons name="chevron-back-outline" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.yearText}>{selectedYear}</Text>
              <TouchableOpacity onPress={() => handleYearChange('right')}>
                <Ionicons name="chevron-forward-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.monthGrid}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthItem,
                    selectedMonth === index && styles.selectedMonthItem,
                  ]}
                  onPress={() => handleMonthSelect(index)}
                >
                  <Text
                    style={[
                      styles.monthTextItem,
                      selectedMonth === index && styles.selectedMonthText,
                    ]}
                  >
                    {month.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close-circle-outline" size={28} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transaction Details Modal */}
      <TransactionDetailModal
        visible={selectedTransaction !== null}
        transaction={selectedTransaction}
        getCurrencySymbol={getCurrencySymbol}
        onClose={closeTransactionDetails}
      />

      {/* Dropdown Menu Modal */}
      <Modal visible={isMenuVisible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={openSettings}>
              <Ionicons name="settings-outline" size={20} color="#333" />
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>

            {/* New "Transactions" Option */}
            <TouchableOpacity style={styles.menuItem} onPress={openTransactions}>
              <Ionicons name="list-outline" size={20} color="#333" />
              <Text style={styles.menuText}>Transactions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={toggleProgressBar}>
              <Ionicons name="bar-chart-outline" size={20} color="#333" />
              <Text style={styles.menuText}>Toggle Progress</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  progressBarContainer: {
    height: 10,
    flexDirection: 'row',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarSection: {
    height: '100%',
  },
  savingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  transactionSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  transactionAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginVertical: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  calendarWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  yearNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  yearText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  monthItem: {
    width: '30%',
    paddingVertical: 10,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  selectedMonthItem: {
    backgroundColor: '#4CAF50',
  },
  monthTextItem: {
    fontSize: 16,
    color: '#666',
  },
  selectedMonthText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '60%',
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});

export default HomePage;
