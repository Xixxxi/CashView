// components/AccountModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, defaultAccounts } from '../context/AccountData';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAccount: (accountLabel: string) => void;
}

const ACCOUNT_STORAGE_KEY = '@accounts';

// Calculate item width based on screen width and desired number of columns
const screenWidth = Dimensions.get('window').width;
const numColumns = 4;
const itemMargin = 12;
const itemSize = (screenWidth - (numColumns + 1) * itemMargin) / numColumns;

const AccountModal: React.FC<AccountModalProps> = ({
  visible,
  onClose,
  onSelectAccount,
}) => {
  const [localAccounts, setLocalAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createAccountModalVisible, setCreateAccountModalVisible] = useState(false);
  const [editAccountModalVisible, setEditAccountModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newAccountTitle, setNewAccountTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IoniconsName>('wallet-outline');

  // Icon options for account creation/editing
  const iconOptions: IoniconsName[] = [
    'wallet-outline',
    'card-outline',
    'cash-outline',
    'home-outline',
    'business-outline',
    'car-outline',
    'briefcase-outline',
    'school-outline',
    'airplane-outline',
    'fitness-outline',
    'fast-food-outline',
    'game-controller-outline',
    'medical-outline',
    'paw-outline',
    'pricetag-outline',
    'restaurant-outline',
    'train-outline',
  ];

  // Load accounts from AsyncStorage when the modal becomes visible
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const savedAccounts = await AsyncStorage.getItem(ACCOUNT_STORAGE_KEY);
        if (savedAccounts) {
          setLocalAccounts(JSON.parse(savedAccounts));
        } else {
          setLocalAccounts(defaultAccounts);
        }
      } catch (error) {
        console.error('Failed to load accounts from storage:', error);
        setLocalAccounts(defaultAccounts);
      } finally {
        setIsLoading(false);
      }
    };

    if (visible) {
      loadAccounts();
    }
  }, [visible]);

  // Save accounts to AsyncStorage
  const saveAccounts = async (accounts: Account[]) => {
    try {
      await AsyncStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error('Failed to save accounts to storage:', error);
      Alert.alert('Error', 'Failed to save accounts.');
    }
  };

  // Handle account selection
  const handleAccountSelect = (accountLabel: string) => {
    onSelectAccount(accountLabel);
    onClose();
  };

  // Filtered accounts based on search query
  const filteredAccounts = localAccounts.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle creating a new account
  const handleCreateAccount = () => {
    if (newAccountTitle.trim() !== '') {
      const existingAccount = localAccounts.find(
        (acc) => acc.label.toLowerCase() === newAccountTitle.trim().toLowerCase()
      );
      if (existingAccount) {
        Alert.alert('Duplicate Account', 'This account already exists.');
        return;
      }

      const newAccount: Account = {
        id: Date.now(),
        label: newAccountTitle.trim(),
        icon: selectedIcon,
      };
      const updatedAccounts = [...localAccounts, newAccount];
      setLocalAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
      setCreateAccountModalVisible(false);
      setNewAccountTitle('');
      setSelectedIcon('wallet-outline');
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid account title.');
    }
  };

  // Handle editing an existing account
  const handleEditAccount = () => {
    if (selectedAccount && newAccountTitle.trim() !== '') {
      const existingAccount = localAccounts.find(
        (acc) =>
          acc.label.toLowerCase() === newAccountTitle.trim().toLowerCase() &&
          acc.id !== selectedAccount.id
      );
      if (existingAccount) {
        Alert.alert('Duplicate Account', 'This account already exists.');
        return;
      }

      const updatedAccounts = localAccounts.map((acc) =>
        acc.id === selectedAccount.id
          ? { ...acc, label: newAccountTitle.trim(), icon: selectedIcon }
          : acc
      );
      setLocalAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
      setEditAccountModalVisible(false);
      setSelectedAccount(null);
      setNewAccountTitle('');
      setSelectedIcon('wallet-outline');
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid account title.');
    }
  };

  // Handle deleting an account
  const handleDeleteAccount = () => {
    if (selectedAccount) {
      Alert.alert(
        'Delete Account',
        `Are you sure you want to delete the account "${selectedAccount.label}"? This will also remove it from all associated transactions.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              const updatedAccounts = localAccounts.filter((acc) => acc.id !== selectedAccount.id);
              setLocalAccounts(updatedAccounts);
              saveAccounts(updatedAccounts);
              setEditAccountModalVisible(false);
              setSelectedAccount(null);
              setNewAccountTitle('');
              setSelectedIcon('wallet-outline');
            },
          },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <Modal visible={visible} transparent={true} animationType="fade">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </Modal>
    );
  }

  return (
    <>
      {/* Main Account Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Accounts</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={28} color="#555" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Accounts"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#AAA"
        />
        <FlatList
          data={filteredAccounts}
          numColumns={numColumns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.accountItem}
              onPress={() => handleAccountSelect(item.label)}
              onLongPress={() => {
                setSelectedAccount(item);
                setNewAccountTitle(item.label);
                setSelectedIcon(item.icon);
                setEditAccountModalVisible(true);
              }}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as IoniconsName} size={24} color="#FFF" />
              </View>
              <Text style={styles.accountLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No accounts found.</Text>
          }
          contentContainerStyle={styles.flatListContent}
        />
        <TouchableOpacity
          style={styles.newAccountButton}
          onPress={() => setCreateAccountModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={28} color="#4CAF50" />
          <Text style={styles.newAccountText}>Add New Account</Text>
        </TouchableOpacity>
      </Modal>

      {/* Modal for Creating New Account */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={createAccountModalVisible}
        onRequestClose={() => setCreateAccountModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setCreateAccountModalVisible(false)}
        >
          <View style={styles.createModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Account</Text>
              <TouchableOpacity onPress={() => setCreateAccountModalVisible(false)}>
                <Ionicons name="close-outline" size={28} color="#555" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Account Title"
              placeholderTextColor="#AAA"
              value={newAccountTitle}
              onChangeText={setNewAccountTitle}
            />
            <Text style={styles.selectIconText}>Select an Icon</Text>
            <FlatList
              data={iconOptions}
              numColumns={numColumns}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.iconItem,
                    selectedIcon === item && styles.selectedIconItem,
                  ]}
                  onPress={() => setSelectedIcon(item)}
                >
                  <Ionicons
                    name={item}
                    size={24}
                    color={selectedIcon === item ? '#FFF' : '#4CAF50'}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.iconList}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateAccount}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateAccountModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal for Editing Account */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editAccountModalVisible}
        onRequestClose={() => setEditAccountModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setEditAccountModalVisible(false)}
        >
          <View style={styles.createModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Account</Text>
              <TouchableOpacity onPress={() => setEditAccountModalVisible(false)}>
                <Ionicons name="close-outline" size={28} color="#555" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Account Title"
              placeholderTextColor="#AAA"
              value={newAccountTitle}
              onChangeText={setNewAccountTitle}
            />
            <Text style={styles.selectIconText}>Select an Icon</Text>
            <FlatList
              data={iconOptions}
              numColumns={numColumns}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.iconItem,
                    selectedIcon === item && styles.selectedIconItem,
                  ]}
                  onPress={() => setSelectedIcon(item)}
                >
                  <Ionicons
                    name={item}
                    size={24}
                    color={selectedIcon === item ? '#FFF' : '#4CAF50'}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.iconList}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditAccount}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Loading Indicator Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Main Modal Styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  searchBar: {
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  flatListContent: {
    paddingHorizontal: itemMargin,
  },
  accountItem: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: itemMargin / 2,
    width: itemSize,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50', // Neutral Green Accent
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  accountLabel: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
    marginTop: 20,
  },
  newAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    margin: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  newAccountText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  // Create/Edit Account Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  createModalContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
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
  selectIconText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  iconItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    margin: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9', // Light Green Background
    width: itemSize - 24, // Adjusted for padding and margins
    height: itemSize - 24,
  },
  selectedIconItem: {
    backgroundColor: '#4CAF50',
  },
  iconList: {
    justifyContent: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountModal;
