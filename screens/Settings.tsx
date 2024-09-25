// screens/Settings.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactionContext } from '../context/TransactionContext';

const PASSWORD_STORAGE_KEY = '@app_password';

const currencies = [
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '€', code: 'EUR', name: 'Euro' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen' },
  { symbol: '£', code: 'GBP', name: 'British Pound Sterling' },
  { symbol: '₽', code: 'RUB', name: 'Russian Ruble' },
  { symbol: 'MX$', code: 'MXN', name: 'Mexican Peso' },
  { symbol: 'CHF', code: 'CHF', name: 'Swiss Franc' },
  { symbol: '¥', code: 'CNY', name: 'Chinese Yuan' },
  { symbol: 'kr', code: 'SEK', name: 'Swedish Krona' },
  { symbol: 'NZ$', code: 'NZD', name: 'New Zealand Dollar' },
  { symbol: '₩', code: 'KRW', name: 'South Korean Won' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  { symbol: 'R$', code: 'BRL', name: 'Brazilian Real' },
  { symbol: 'R', code: 'ZAR', name: 'South African Rand' },
];

const Settings: React.FC = () => {
  const navigation = useNavigation();
  const { setTransactions } = useTransactionContext();

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('€');

  useEffect(() => {
    const checkPasswordAndCurrency = async () => {
      try {
        const storedPassword = await AsyncStorage.getItem(PASSWORD_STORAGE_KEY);
        const storedCurrency = await AsyncStorage.getItem('@default_currency');
        if (storedPassword) {
          setIsPasswordSet(true);
        } else {
          setIsPasswordSet(false);
        }
        if (storedCurrency) {
          setSelectedCurrency(storedCurrency);
        }
      } catch (error) {
        console.error('Failed to load settings from storage:', error);
      }
    };

    checkPasswordAndCurrency();
  }, []);

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      await AsyncStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
      setIsPasswordSet(true);
      setPasswordModalVisible(false);
      setIsPasswordVerified(false);
      Alert.alert('Success', 'Password has been set.');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordInput('');
    } catch (error) {
      console.error('Failed to save password:', error);
      Alert.alert('Error', 'Failed to save password.');
    }
  };

  const handleDeleteUserData = async () => {
    Alert.alert(
      'Delete User Data',
      'Are you sure you want to delete all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@transactions');
              await AsyncStorage.removeItem(PASSWORD_STORAGE_KEY);
              await AsyncStorage.removeItem('@default_currency');
              setTransactions([]);
              setIsPasswordSet(false);
              setSelectedCurrency('€');
              Alert.alert('Success', 'All user data has been deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user data.');
              console.error('Failed to delete user data', error);
            }
          },
        },
      ]
    );
  };

  const handleVerifyCurrentPassword = async () => {
    try {
      const storedPassword = await AsyncStorage.getItem(PASSWORD_STORAGE_KEY);
      if (storedPassword === currentPasswordInput) {
        setIsPasswordVerified(true);
        setCurrentPasswordInput('');
      } else {
        Alert.alert('Error', 'Incorrect current password.');
      }
    } catch (error) {
      console.error('Failed to verify password:', error);
      Alert.alert('Error', 'Failed to verify password.');
    }
  };

  const openPasswordModal = () => {
    setPasswordModalVisible(true);
    setIsPasswordVerified(false);
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPasswordInput('');
  };

  const openCurrencyModal = () => {
    setCurrencyModalVisible(true);
  };

  const handleCurrencySelect = async (currencySymbol: string) => {
    try {
      await AsyncStorage.setItem('@default_currency', currencySymbol);
      setSelectedCurrency(currencySymbol);
      setCurrencyModalVisible(false);
      Alert.alert('Success', 'Default currency has been updated.');
    } catch (error) {
      console.error('Failed to save currency:', error);
      Alert.alert('Error', 'Failed to save currency.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Account Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity style={styles.optionRow} onPress={openPasswordModal}>
            <View style={styles.optionLeft}>
              <Ionicons name="lock-closed-outline" size={24} color="#4CAF50" />
              <Text style={styles.optionText}>
                {isPasswordSet ? 'Change Password' : 'Add Password'}
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#777" />
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <TouchableOpacity style={styles.optionRow} onPress={openCurrencyModal}>
            <View style={styles.optionLeft}>
              <Ionicons name="wallet-outline" size={24} color="#4CAF50" />
              <Text style={styles.optionText}>Default Currency</Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.currencyText}>{selectedCurrency}</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#777" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow} onPress={handleDeleteUserData}>
            <View style={styles.optionLeft}>
              <Ionicons name="trash-outline" size={24} color="#F44336" />
              <Text style={[styles.optionText, { color: '#F44336' }]}>
                Delete User Data
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#777" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Back Button at the Bottom */}
      <TouchableOpacity style={styles.bottomBackButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle-outline" size={56} color="#4CAF50" />
      </TouchableOpacity>

      {/* Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {isPasswordSet && !isPasswordVerified ? (
              <>
                <Text style={styles.modalTitle}>Enter Current Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  secureTextEntry={true}
                  value={currentPasswordInput}
                  onChangeText={setCurrentPasswordInput}
                  autoFocus={true}
                />
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.verifyButton]}
                    onPress={handleVerifyCurrentPassword}
                  >
                    <Text style={styles.modalButtonText}>Verify</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setPasswordModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  {isPasswordSet ? 'Change Password' : 'Set Password'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  secureTextEntry={true}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoFocus={!isPasswordSet}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  secureTextEntry={true}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSavePassword}
                  >
                    <Text style={styles.modalButtonText}>Save Password</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setPasswordModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={currencyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.currencyModalContainer}>
            <View style={styles.currencyModalHeader}>
              <Text style={styles.modalTitle}>Select Default Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={currencies}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.currencyOption}
                  onPress={() => handleCurrencySelect(item.symbol)}
                >
                  <View style={styles.currencyOptionLeft}>
                    <Ionicons name="wallet-outline" size={24} color="#4CAF50" />
                    <Text style={styles.currencyOptionText}>
                      {item.symbol} - {item.name}
                    </Text>
                  </View>
                  {selectedCurrency === item.symbol && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  // Content styles
  content: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Currency Modal styles
  currencyModalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  currencyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  currencyOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  // Bottom Back Button styles
  bottomBackButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    // Alternatively, you can center it horizontally by adjusting 'left'
    // left: '50%',
    // transform: [{ translateX: -28 }], // Half of the button width to center
  },
});

export default Settings;
