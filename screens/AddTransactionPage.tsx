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
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>(
    'expense'
  );
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Gehälter');
  const [date, setDate] = useState(getCurrentDate());
  const [account, setAccount] = useState('Savings');
  const [repeating, setRepeating] = useState<
    'No' | 'Monthly' | 'Quarterly' | 'Annually'
  >('No');
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
    if (amount) {
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
      navigation.goBack();
    } else {
      console.log('Please enter an amount.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleRepeatingSelect = (
    repeatingOption: 'No' | 'Monthly' | 'Quarterly' | 'Annually'
  ) => {
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Transaction</Text>
      </View>

      <View style={styles.transactionType}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === 'income' && styles.activeType,
          ]}
          onPress={() => setTransactionType('income')}
        >
          <Ionicons
            name="cash-outline"
            size={16}
            color={transactionType === 'income' ? '#FFF' : '#4CAF50'}
          />
          <Text
            style={
              transactionType === 'income' ? styles.activeTypeText : styles.typeText
            }
          >
            INCOME
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === 'expense' && styles.activeType,
          ]}
          onPress={() => setTransactionType('expense')}
        >
          <Ionicons
            name="cart-outline"
            size={16}
            color={transactionType === 'expense' ? '#FFF' : '#FF6347'}
          />
          <Text
            style={
              transactionType === 'expense' ? styles.activeTypeText : styles.typeText
            }
          >
            EXPENSE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input for Amount */}
      <View style={styles.amountInputContainer}>
        <TextInput
          style={styles.amountInput}
          keyboardType="numeric"
          placeholder={`0.00 ${defaultCurrency}`}
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Transaction Details */}
      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.clickableCategory}>{category}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <TouchableOpacity onPress={showDatePicker}>
            <Text style={styles.clickableCategory}>{date}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account</Text>
          <Text style={styles.detailValue}>{account}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Repeating</Text>
          <TouchableOpacity onPress={() => setRepeatingModalVisible(true)}>
            <Text
              style={[
                styles.clickableCategory,
                repeating !== 'No' && styles.activeRepeating,
              ]}
            >
              {repeating}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Enter notes"
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </View>

      {/* Save and Cancel Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <CategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCategory={(categoryLabel) => setCategory(categoryLabel)}
      />

      {/* Modal for Repeating Selection */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={repeatingModalVisible}
        onRequestClose={() => setRepeatingModalVisible(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setRepeatingModalVisible(false)}>
            <Ionicons name="close-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>REPEATING</Text>
        </View>

        <FlatList
          data={['No', 'Monthly', 'Quarterly', 'Annually']}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.repeatingItem,
                repeating === item && styles.selectedRepeatingItem,
              ]}
              onPress={() => handleRepeatingSelect(item as any)}
            >
              <Text style={styles.repeatingLabel}>{item}</Text>
            </TouchableOpacity>
          )}
        />
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  transactionType: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6347',
    marginHorizontal: 8,
  },
  activeType: {
    backgroundColor: '#FF6347',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF6347',
  },
  activeTypeText: {
    color: '#FFF',
  },
  amountInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 24,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  transactionDetails: {
    marginTop: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#777',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  clickableCategory: {
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textAlign: 'center',
  },
  activeRepeating: {
    backgroundColor: '#4CAF50',
    color: '#FFF',
  },
  notesInput: {
    borderBottomWidth: 1,
    borderColor: '#DDD',
    paddingBottom: 8,
    flex: 1,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  button: {
    flex: 1,
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  repeatingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#DDD',
  },
  repeatingLabel: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedRepeatingItem: {
    backgroundColor: '#4CAF50',
    color: '#FFF',
    borderRadius: 8,
  },
});

export default AddTransactionPage;
