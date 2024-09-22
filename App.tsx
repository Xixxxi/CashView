// App.tsx
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomePage from './screens/HomePage';
import AddTransactionPage from './screens/AddTransactionPage';
import Settings from './screens/Settings'; // Import the Settings screen
import { TransactionProvider } from './context/TransactionContext'; // Import the context provider

import AsyncStorage from '@react-native-async-storage/async-storage';
import PasswordScreen from './screens/PasswordScreen'; // We'll create this component

const PASSWORD_STORAGE_KEY = '@app_password';

const Stack = createStackNavigator();

export default function App() {
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(true);

  useEffect(() => {
    const checkIfPasswordIsSet = async () => {
      try {
        const storedPassword = await AsyncStorage.getItem(PASSWORD_STORAGE_KEY);
        if (storedPassword) {
          setIsPasswordRequired(true);
        } else {
          setIsPasswordRequired(false);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to check password:', error);
      } finally {
        setIsCheckingPassword(false);
      }
    };

    checkIfPasswordIsSet();
  }, []);

  if (isCheckingPassword) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <TransactionProvider>
      {isPasswordRequired && !isAuthenticated ? (
        <PasswordScreen onAuthentication={() => setIsAuthenticated(true)} />
      ) : (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomePage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={Settings} 
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </TransactionProvider>
  );
}
