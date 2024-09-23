// screens/HomePage.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
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
import { ComponentProps } from 'react';
import { Category, categories as defaultCategories } from '../context/CategoryData';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

const CATEGORY_STORAGE_KEY = '@categories';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const exchangeRates: { [key: string]: number } = {
  'USD': 1.00,     // US Dollar
  'EUR': 0.92,     // Euro
  'GBP': 0.77,     // British Pound Sterling
  'JPY': 156.93,   // Japanese Yen
  'INR': 83.97,    // Indian Rupee
  'RUB': 88.31,    // Russian Ruble
  'MXN': 19.17,    // Mexican Peso
  'CHF': 0.89,     // Swiss Franc
  'CNY': 7.09,     // Chinese Yuan
  'SEK': 10.18,    // Swedish Krona
  'NZD': 1.49,     // New Zealand Dollar
  'KRW': 1363.94,  // South Korean Won
  'BRL': 5.04,     // Brazilian Real
  'ZAR': 18.95,    // South African Rand
  // Add more currencies as needed
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
  // Add more currencies as needed
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
  const [defaultCurrencyCode, setDefaultCurrencyCode] = useState<string>('USD');
  const [categories, setCategories] = useState<Category[]>([]);

  const getCurrencyCodeFromSymbol = (symbol: string): string | undefined => {
    return Object.keys(currencySymbols).find((key) => currencySymbols[key] === symbol);
  };

  const getCurrencySymbol = (code: string): string => {
    return currencySymbols[code] || code;
  };

  // Load categories from AsyncStorage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const savedCategories = await AsyncStorage.getItem(CATEGORY_STORAGE_KEY);
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          // If no categories are saved, use default categories
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Failed to load categories from storage:', error);
        // If there's an error, use default categories
        setCategories(defaultCategories);
      }
    };
    loadCategories();
  }, []);

  // Use useFocusEffect to reload default currency when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      const loadDefaultCurrency = async () => {
        try {
          const currencySymbol = await AsyncStorage.getItem('@default_currency');
          if (currencySymbol) {
            const currencyCode = getCurrencyCodeFromSymbol(currencySymbol);
            if (currencyCode) {
              setDefaultCurrencyCode(currencyCode);
            } else {
              setDefaultCurrencyCode('USD'); // Default to USD if code not found
            }
          } else {
            setDefaultCurrencyCode('USD'); // Default to USD if not set
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
      // If exchange rate is not defined, assume 1:1 conversion
      return amount;
    }

    // Convert amount from the original currency to base currency (USD), then from base currency to target currency
    const amountInBaseCurrency = amount / fromRate; // Convert to base currency (USD)
    const convertedAmount = amountInBaseCurrency * toRate; // Convert to target currency
    return convertedAmount;
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = moment(transaction.date, 'DD MMMM YYYY');
    return (
      transactionDate.year() === selectedYear &&
      transactionDate.month() === selectedMonth
    );
  });

  // Calculate totals by converting amounts to the default currency
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

  const toggleProgressBar = () => {
    setShowProgressBar((prev) => !prev);
    setIsMenuVisible(false);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    removeTransaction(transaction.id);
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
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Text style={styles.monthText}>
            {months[selectedMonth]} {selectedYear}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
          <Ionicons name="ellipsis-horizontal-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Summary Section */}
      <View style={styles.summary}>
        <Text style={styles.sectionTitle}>Summary</Text>
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
      <View style={styles.incomeSection}>
        <Text style={styles.sectionTitle}>Income</Text>
        {incomeTransactions.map((transaction: Transaction) => (
          <TouchableOpacity
            key={transaction.id}
            style={styles.transactionItem}
            onPress={() => openTransactionDetails(transaction)}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#AB47BC' }]}>
              <Ionicons
                name={getCategoryIcon(transaction.category)}
                size={24}
                color="#FFF"
              />
            </View>
            <Text style={styles.itemText}>{transaction.category}</Text>
            <Text style={styles.itemText}>
              {transaction.amount}{' '}
              {transaction.currency || getCurrencySymbol(defaultCurrencyCode)}
            </Text>
            <TouchableOpacity
              onPress={() => handleDeleteTransaction(transaction)}
            >
              <Ionicons name="trash-outline" size={24} color="#FF6347" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        {incomeTransactions.length === 0 && (
          <Text style={styles.placeholderText}>
            No income transactions for this month.
          </Text>
        )}
      </View>

      {/* Expense Section */}
      <View style={styles.expenseSection}>
        <Text style={styles.sectionTitle}>Expenses</Text>
        {expenseTransactions.map((transaction: Transaction) => (
          <TouchableOpacity
            key={transaction.id}
            style={styles.transactionItem}
            onPress={() => openTransactionDetails(transaction)}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FF7043' }]}>
              <Ionicons
                name={getCategoryIcon(transaction.category)}
                size={24}
                color="#FFF"
              />
            </View>
            <Text style={styles.itemText}>{transaction.category}</Text>
            <Text style={styles.itemText}>
              {transaction.amount}{' '}
              {transaction.currency || getCurrencySymbol(defaultCurrencyCode)}
            </Text>
            <TouchableOpacity
              onPress={() => handleDeleteTransaction(transaction)}
            >
              <Ionicons name="trash-outline" size={24} color="#FF6347" />
            </TouchableOpacity>
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
        <Ionicons name="add-outline" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Calendar Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.calendarWrapper}>
            <View style={styles.yearNavigation}>
              <TouchableOpacity onPress={() => handleYearChange('left')}>
                <Ionicons name="arrow-back-outline" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.yearText}>{selectedYear}</Text>
              <TouchableOpacity onPress={() => handleYearChange('right')}>
                <Ionicons name="arrow-forward-outline" size={24} color="black" />
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
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.transactionDetailsWrapper}>
              <Text style={styles.transactionDetailTitle}>
                Transaction Details
              </Text>
              <Text style={styles.transactionDetailText}>
                Category: {selectedTransaction.category}
              </Text>
              <Text style={styles.transactionDetailText}>
                Amount: {selectedTransaction.amount}{' '}
                {selectedTransaction.currency ||
                  getCurrencySymbol(defaultCurrencyCode)}
              </Text>
              <Text style={styles.transactionDetailText}>
                Date: {selectedTransaction.date}
              </Text>
              <Text style={styles.transactionDetailText}>
                Account: {selectedTransaction.account}
              </Text>
              <Text style={styles.transactionDetailText}>
                Repeating: {selectedTransaction.repeating}
              </Text>
              <Text style={styles.transactionDetailText}>
                Notes: {selectedTransaction.notes}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeTransactionDetails}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Dropdown Menu Modal */}
      <Modal visible={isMenuVisible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={openSettings}>
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={toggleProgressBar}>
              <Text style={styles.menuText}>Toggle Progress</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ... [Styles remain unchanged]
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  summary: {
    marginTop: 24,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  summaryItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 16,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBarSection: {
    height: '100%',
  },
  savingText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  incomeSection: {
    marginTop: 24,
  },
  expenseSection: {
    marginTop: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    paddingLeft: 8,
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
    backgroundColor: '#F06292',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    margin: 20,
    padding: 10,
  },
  yearNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  yearText: {
    fontSize: 24,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  monthItem: {
    width: '30%',
    padding: 16,
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
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  transactionDetailsWrapper: {
    backgroundColor: '#FFF',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  transactionDetailTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  transactionDetailText: {
    fontSize: 16,
    marginBottom: 8,
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  menuItem: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});

export default HomePage;
