// screens/PasswordScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PASSWORD_STORAGE_KEY = '@app_password';

interface PasswordScreenProps {
  onAuthentication: () => void;
}

const PasswordScreen: React.FC<PasswordScreenProps> = ({ onAuthentication }) => {
  const [password, setPassword] = useState('');

  const handleAuthenticate = async () => {
    try {
      const storedPassword = await AsyncStorage.getItem(PASSWORD_STORAGE_KEY);
      if (storedPassword === password) {
        onAuthentication();
      } else {
        Alert.alert('Authentication Failed', 'Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (error) {
      console.error('Authentication Error:', error);
      Alert.alert('Error', 'An error occurred during authentication. Please try again.');
    }
  };

  const handleEmergencyUnlock = () => {
    Alert.alert(
      'Emergency Unlock',
      'Are you sure you want to unlock the app without entering your password? This will remove your password and allow access to your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(PASSWORD_STORAGE_KEY);
              onAuthentication();
              Alert.alert('Notice', 'Your password has been removed. Access granted.');
            } catch (error) {
              console.error('Emergency Unlock Error:', error);
              Alert.alert('Error', 'Failed to perform emergency unlock.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={80} color="#4CAF50" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Enter Your Password</Text>

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#AAA"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={handleAuthenticate}
            autoFocus={true}
          />

          {/* Authenticate Button */}
          <TouchableOpacity style={styles.authenticateButton} onPress={handleAuthenticate}>
            <Text style={styles.authenticateButtonText}>Unlock</Text>
          </TouchableOpacity>

          {/* Emergency Unlock */}
          <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyUnlock}>
            <Text style={styles.emergencyButtonText}>Emergency Unlock</Text>
          </TouchableOpacity>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  authenticateButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authenticateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emergencyButton: {
    marginTop: 8,
  },
  emergencyButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PasswordScreen;
