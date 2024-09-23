// components/TransactionDetailModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, useTransactionContext } from '../context/TransactionContext';

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  getCurrencySymbol: (code: string) => string;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  getCurrencySymbol,
  onClose,
}) => {
  const { updateTransaction } = useTransactionContext();
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (transaction) {
      setNotes(transaction.notes);
    }
  }, [transaction]);

  const handleSaveNotes = () => {
    if (transaction) {
      updateTransaction(transaction.id, { notes });
      Alert.alert('Success', 'Notes have been updated.');
      onClose();
    }
  };

  if (!transaction) {
    return null;
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Transaction Details</Text>
            <ScrollView contentContainerStyle={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{transaction.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>
                  {transaction.amount} {transaction.currency ? getCurrencySymbol(transaction.currency) : getCurrencySymbol('USD')}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{transaction.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account:</Text>
                <Text style={styles.detailValue}>{transaction.account}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Repeating:</Text>
                <Text style={styles.detailValue}>{transaction.repeating}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Notes:</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add notes..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveNotes}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close-circle-outline" size={32} color="#FF6347" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  detailsContainer: {
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButton: {
    // Only the close icon is displayed
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionDetailModal;
