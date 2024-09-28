// screens/TransactionOverview.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTransactionContext, Transaction } from '../context/TransactionContext';
import { Category, categories as defaultCategories } from '../context/CategoryData';
import TransactionDetailModal from '../components/TransactionDetailModal';
import CategoryModal from '../components/CategoryModal';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Months Array
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Currency symbols mapping
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

// Function to get currency symbol from code
const getCurrencySymbol = (code: string): string => {
  return currencySymbols[code] || '$';
};

const TransactionOverview: React.FC = () => {
  const { transactions, removeTransaction, updateTransaction } = useTransactionContext();
  const navigation = useNavigation<NavigationProp<any>>();

  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for Month and Year Selection
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);

  // Load categories from AsyncStorage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const savedCategories = await AsyncStorage.getItem('@categories');
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Failed to load categories from storage:', error);
        setCategories(defaultCategories);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filter transactions based on search, type, category, month, and year
  useEffect(() => {
    let tempTransactions = [...transactions];

    // Filter by search query
    if (searchQuery.trim() !== '') {
      tempTransactions = tempTransactions.filter((t) =>
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by transaction type
    if (filterType !== 'all') {
      tempTransactions = tempTransactions.filter((t) => t.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'All') {
      tempTransactions = tempTransactions.filter((t) => t.category === filterCategory);
    }

    // Filter by selected month and year
    tempTransactions = tempTransactions.filter((t) => {
      const transactionDate = moment(t.date, 'DD MMMM YYYY');
      return transactionDate.year() === selectedYear && transactionDate.month() === selectedMonth;
    });

    // Sort transactions by date (earliest first)
    tempTransactions.sort((a, b) => {
      const dateA = moment(a.date, 'DD MMMM YYYY').toDate();
      const dateB = moment(b.date, 'DD MMMM YYYY').toDate();
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredTransactions(tempTransactions);
  }, [transactions, searchQuery, filterType, filterCategory, selectedYear, selectedMonth]);

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

  const getCategoryIcon = (categoryLabel: string): IoniconsName => {
    const foundCategory = categories.find((cat) => cat.label === categoryLabel);
    return foundCategory ? (foundCategory.icon as IoniconsName) : 'help-outline';
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === 'income';
    const currencySymbol = item.currency ? getCurrencySymbol(item.currency) : '$';
    const amountColor = isIncome ? '#4CAF50' : '#F44336';
    const formattedDate = moment(item.date, 'DD MMMM YYYY').format('MMM DD, YYYY');

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() => setSelectedTransaction(item)}
      >
        <View style={[styles.iconCircle, { backgroundColor: isIncome ? '#4CAF50' : '#F44336' }]}>
          <Ionicons name={getCategoryIcon(item.category)} size={20} color="#FFF" />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionDate}>{formattedDate}</Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text style={[styles.transactionAmount, { color: amountColor }]}>
            {isIncome ? '+' : '-'}{item.amount} {currencySymbol}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleFilterApply = (type: 'all' | 'income' | 'expense', category: string) => {
    setFilterType(type);
    setFilterCategory(category);
    setIsFilterModalVisible(false);
  };

  // Handle Year Change
  const handleYearChange = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setSelectedYear(prevYear => prevYear - 1);
    } else {
      setSelectedYear(prevYear => prevYear + 1);
    }
  };

  // Handle Month Selection
  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setIsMonthModalVisible(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Custom Header with Month and Year Selection */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back-outline" size={28} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={() => handleYearChange('left')} style={styles.chevronButton}>
              <Ionicons name="chevron-back-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsMonthModalVisible(true)} style={styles.monthDisplay}>
              <Text style={styles.headerTitle}>{months[selectedMonth]} {selectedYear}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleYearChange('right')} style={styles.chevronButton}>
              <Ionicons name="chevron-forward-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={() => setIsFilterModalVisible(true)}>
            <Ionicons name="funnel-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#AAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle-outline" size={20} color="#777" />
            </TouchableOpacity>
          )}
        </View>

        {/* Transactions List */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransactionItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>No transactions found.</Text>
            </View>
          }
        />

        {/* Transaction Detail Modal */}
        <TransactionDetailModal
          visible={selectedTransaction !== null}
          transaction={selectedTransaction}
          getCurrencySymbol={getCurrencySymbol}
          onClose={() => setSelectedTransaction(null)}
        />

        {/* Filter Modal */}
        <Modal visible={isFilterModalVisible} transparent={true} animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setIsFilterModalVisible(false)}
          >
            <View style={styles.filterModalContainer}>
              <Text style={styles.modalTitle}>Filter Transactions</Text>

              {/* Transaction Type Filter */}
              <Text style={styles.filterLabel}>Type</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filterType === 'all' && styles.activeFilterOption,
                  ]}
                  onPress={() => handleFilterApply('all', filterCategory)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterType === 'all' && styles.activeFilterOptionText,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filterType === 'income' && styles.activeFilterOption,
                  ]}
                  onPress={() => handleFilterApply('income', filterCategory)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterType === 'income' && styles.activeFilterOptionText,
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filterType === 'expense' && styles.activeFilterOption,
                  ]}
                  onPress={() => handleFilterApply('expense', filterCategory)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterType === 'expense' && styles.activeFilterOptionText,
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Category Filter */}
              <Text style={styles.filterLabel}>Category</Text>
              <TouchableOpacity
                style={styles.categoryFilter}
                onPress={() => {
                  setIsFilterModalVisible(false);
                  // Implement CategoryModal or navigate to a CategorySelection screen
                  Alert.alert(
                    'Category Filter',
                    'Category filtering is not implemented yet.'
                  );
                }}
              >
                <Text style={styles.categoryFilterText}>{filterCategory}</Text>
                <Ionicons name="chevron-down-outline" size={20} color="#777" />
              </TouchableOpacity>

              {/* Apply Button */}
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Month Selection Modal */}
        <Modal visible={isMonthModalVisible} transparent={true} animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setIsMonthModalVisible(false)}
          >
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
                onPress={() => setIsMonthModalVisible(false)}
              >
                <Ionicons name="close-circle-outline" size={28} color="#333" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronButton: {
    padding: 4,
  },
  monthDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
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
  calendarWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '90%',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20, // To ensure content is not hidden behind modals
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
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginTop: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  filterModalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
  },
  activeFilterOption: {
    backgroundColor: '#4CAF50',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeFilterOptionText: {
    color: '#FFF',
    fontWeight: '700',
  },
  categoryFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryFilterText: {
    fontSize: 16,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactionOverview;
