/**
 * Supabase Client Configuration
 *
 * Initializes Supabase client with React Native specific storage
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getEnvVar = (key: string): string => {
  const value = Constants.expoConfig?.extra?.[key] ||
                (typeof process !== 'undefined' && process.env?.[key]);

  if (!value) {
    console.error(`Missing environment variable: ${key}`);
    console.log('Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
    console.log('process.env:', typeof process !== 'undefined' ? process.env : 'process not defined');
  }

  return value || '';
};

const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

console.log('Supabase URL:', supabaseUrl ? 'loaded' : 'missing');
console.log('Supabase Key:', supabaseAnonKey ? 'loaded' : 'missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(`Missing Supabase environment variables. URL: ${supabaseUrl ? 'present' : 'missing'}, Key: ${supabaseAnonKey ? 'present' : 'missing'}`);
  // Don't throw error, just use empty strings to prevent app crash
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
