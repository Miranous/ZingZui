/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, signup as signupUser, login as loginUser, logout as logoutUser } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      console.log('Loading user from storage...');
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      console.log('Stored user:', storedUser ? 'found' : 'not found');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      console.log('Auth loading complete');
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ error?: string }> => {
    const result = await signupUser({ email, password, firstName, lastName });

    if (result.error) {
      return { error: result.error };
    }

    if (result.user) {
      setUser(result.user);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
    }

    return {};
  };

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const result = await loginUser({ email, password });

    if (result.error) {
      return { error: result.error };
    }

    if (result.user) {
      setUser(result.user);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
    }

    return {};
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
