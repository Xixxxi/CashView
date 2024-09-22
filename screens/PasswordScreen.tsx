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
} from 'react-native';
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
        Alert.alert('Error', 'Incorrect password.');
      }
    } catch (error) {
      console.error('Failed to authenticate:', error);
      Alert.alert('Error', 'Failed to authenticate.');
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
              Alert.alert('Notice', 'Your password has been removed.');
            } catch (error) {
              console.error('Failed to remove password:', error);
              Alert.alert('Error', 'Failed to remove password.');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Enter Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#AAA"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={handleAuthenticate}
        autoFocus={true}
      />
      <TouchableOpacity style={styles.button} onPress={handleAuthenticate}>
        <Text style={styles.buttonText}>Unlock</Text>
      </TouchableOpacity>

      {/* Emergency Unlock Button */}
      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyUnlock}>
        <Text style={styles.emergencyButtonText}>Emergency Unlock</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  // Title styles
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  // Input styles
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  // Button styles
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Emergency Button styles
  emergencyButton: {
    marginTop: 10,
  },
  emergencyButtonText: {
    color: '#F44336',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default PasswordScreen;
