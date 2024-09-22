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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactionContext } from '../context/TransactionContext';

const PASSWORD_STORAGE_KEY = '@app_password';

const currencies = [
  { symbol: '€', code: 'EUR', name: 'Euro' },
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  // Add more currencies as needed
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
    try {
      await AsyncStorage.removeItem('@transactions');
      await AsyncStorage.removeItem(PASSWORD_STORAGE_KEY);
      setTransactions([]);
      setIsPasswordSet(false);
      Alert.alert('Success', 'All user data has been deleted.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete user data.');
      console.error('Failed to delete user data', error);
    }
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
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Centered Settings Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <TouchableOpacity style={styles.option} onPress={openPasswordModal}>
          <Text style={styles.optionText}>
            {isPasswordSet ? 'Change Password' : 'Add Password'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>App Settings</Text>

        <TouchableOpacity style={styles.option} onPress={openCurrencyModal}>
          <Text style={styles.optionText}>Select Default Currency</Text>
          <Text style={styles.currencySymbol}>{selectedCurrency}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleDeleteUserData}>
          <Text style={styles.optionText}>Delete User Data</Text>
        </TouchableOpacity>
      </View>

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
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleVerifyCurrentPassword}
                  >
                    <Text style={styles.buttonText}>Verify</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setPasswordModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
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

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSavePassword}
                  >
                    <Text style={styles.buttonText}>Save Password</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setPasswordModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
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
            <Text style={styles.modalTitle}>Select Default Currency</Text>
            <FlatList
              data={currencies}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.currencyOption}
                  onPress={() => handleCurrencySelect(item.symbol)}
                >
                  <Text style={styles.currencyOptionText}>
                    {item.symbol} - {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setCurrencyModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Back Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  // Content styles
  content: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center', // Center the text
  },
  option: {
    width: '80%', // Ensure responsiveness
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
    alignItems: 'center', // Center the option text
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  // Footer styles
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  // Button styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
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
    fontWeight: '600',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  currencyModalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  currencyOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#DDD',
  },
  currencyOptionText: {
    fontSize: 18,
    color: '#333',
  },
});

export default Settings;
