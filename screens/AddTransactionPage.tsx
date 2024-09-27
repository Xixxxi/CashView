// screens/AddTransactionPage.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTransactionContext } from '../context/TransactionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CategoryModal from '../components/CategoryModal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const getCurrentDate = (): string => {
  const date = new Date();
  return moment(date).format('DD MMMM YYYY');
};

const AddTransactionPage: React.FC = () => {
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Gehälter');
  const [date, setDate] = useState(getCurrentDate());
  const [account, setAccount] = useState('Savings');
  const [repeating, setRepeating] = useState<'No' | 'Monthly' | 'Quarterly' | 'Annually'>('No');
  const [notes, setNotes] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [repeatingModalVisible, setRepeatingModalVisible] = useState(false);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState<string>('€');

  const { addTransaction } = useTransactionContext();
  const navigation = useNavigation();

  useEffect(() => {
    const loadDefaultCurrency = async () => {
      try {
        const currency = await AsyncStorage.getItem('@default_currency');
        if (currency) {
          setDefaultCurrency(currency);
        }
      } catch (error) {
        console.error('Failed to load default currency:', error);
      }
    };
    loadDefaultCurrency();
  }, []);

  const handleSave = () => {
    if (amount.trim() === '') {
      Alert.alert('Validation Error', 'Please enter an amount.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than zero.');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type: transactionType,
      amount,
      category,
      date,
      account,
      repeating,
      notes,
      currency: defaultCurrency,
    };

    addTransaction(newTransaction);
    Alert.alert('Success', 'Transaction added successfully.');
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleRepeatingSelect = (repeatingOption: 'No' | 'Monthly' | 'Quarterly' | 'Annually') => {
    setRepeating(repeatingOption);
    setRepeatingModalVisible(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (selectedDate: Date) => {
    const formattedDate = moment(selectedDate).format('DD MMMM YYYY');
    setDate(formattedDate);
    hideDatePicker();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Transaction</Text>
            <View style={{ width: 24 }} /> 
          </View>

          {/* Transaction Type Selection */}
          <View style={styles.transactionTypeContainer}>
            {/* Income Button */}
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'income' && styles.activeIncomeButton,
              ]}
              onPress={() => setTransactionType('income')}
            >
              <Ionicons
                name="cash-outline"
                size={20}
                color={transactionType === 'income' ? '#FFF' : '#4CAF50'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  transactionType === 'income' && styles.activeTypeButtonText,
                ]}
              >
                INCOME
              </Text>
            </TouchableOpacity>

            {/* Expenses Button */}
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'expense' && styles.activeExpenseButton,
              ]}
              onPress={() => setTransactionType('expense')}
            >
              <Ionicons
                name="cart-outline"
                size={20}
                color={transactionType === 'expense' ? '#FFF' : '#FF6347'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  transactionType === 'expense' && styles.activeTypeButtonText,
                ]}
              >
                EXPENSE
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              placeholder={`0.00 ${defaultCurrency}`}
              placeholderTextColor="#AAA"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Transaction Details */}
          <View style={styles.detailsContainer}>
            {/* Category */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <TouchableOpacity
                style={styles.detailValueContainer}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.detailValueText}>{category}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Date */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <TouchableOpacity style={styles.detailValueContainer} onPress={showDatePicker}>
                <Text style={styles.detailValueText}>{date}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Account */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account</Text>
              <Text style={styles.detailValueText}>{account}</Text>
            </View>

            {/* Repeating */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Repeating</Text>
              <TouchableOpacity
                style={styles.detailValueContainer}
                onPress={() => setRepeatingModalVisible(true)}
              >
                <Text
                  style={[
                    styles.detailValueText,
                    repeating !== 'No' && styles.activeRepeatingText,
                  ]}
                >
                  {repeating}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes..."
                placeholderTextColor="#AAA"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {/* Save and Cancel Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <CategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCategory={(categoryLabel) => setCategory(categoryLabel)}
      />

      {/* Repeating Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={repeatingModalVisible}
        onRequestClose={() => setRepeatingModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setRepeatingModalVisible(false)}
        >
          <View style={styles.repeatingModalContent}>
            <Text style={styles.modalTitle}>Set Repeating</Text>
            <FlatList
              data={['No', 'Monthly', 'Quarterly', 'Annually']}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    repeating === item && styles.selectedModalOption,
                  ]}
                  onPress={() => handleRepeatingSelect(item as any)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      repeating === item && styles.selectedModalOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={moment(date, 'DD MMMM YYYY').toDate()}
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />
    </SafeAreaView>
  );
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  keyboardContainer: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  // Transaction Type Selection
  transactionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#DDD',
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activeExpenseButton: {
    backgroundColor: '#FF6347',
    borderColor: '#FF6347',
  },
  activeIncomeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  activeTypeButtonText: {
    color: '#FFF',
  },
  // Amount Input
  amountContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  amountInput: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  // Transaction Details
  detailsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
  },
  detailValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  detailValueText: {
    fontSize: 16,
    color: '#333',
  },
  activeRepeatingText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    height: 60,
  },
  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Repeating Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatingModalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  modalOption: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#F0F4F8',
  },
  selectedModalOption: {
    backgroundColor: '#4CAF50',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedModalOptionText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

export default AddTransactionPage;
