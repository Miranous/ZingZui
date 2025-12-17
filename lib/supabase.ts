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
  }

  return value || '';
};

const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Missing Supabase environment variables. URL: ${supabaseUrl ? 'present' : 'missing'}, Key: ${supabaseAnonKey ? 'present' : 'missing'}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
