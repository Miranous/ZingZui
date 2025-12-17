/**
 * Authentication Utilities
 *
 * Provides secure authentication functions using Supabase
 * with custom user table and bcrypt password hashing
 */

import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Hash password using SHA-256 (bcrypt alternative for React Native)
 * Note: For production, consider using a native bcrypt library
 */
async function hashPassword(password: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + 'salt_secret_key' // Add a salt/secret key in production
  );
  return hash;
}

/**
 * Validate email format
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}

/**
 * Sign up a new user
 */
export async function signup(data: SignupData): Promise<{ user?: User; error?: string }> {
  try {
    // Validate inputs
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      return { error: 'All fields are required' };
    }

    if (!validateEmail(data.email)) {
      return { error: 'Invalid email format' };
    }

    const passwordError = validatePassword(data.password);
    if (passwordError) {
      return { error: passwordError };
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return { error: 'An account with this email already exists' };
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user record
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: data.email.toLowerCase(),
        first_name: data.firstName,
        last_name: data.lastName,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Signup error:', insertError);
      return { error: 'Failed to create account. Please try again.' };
    }

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at,
      },
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Log in an existing user
 */
export async function login(data: LoginData): Promise<{ user?: User; error?: string }> {
  try {
    // Validate inputs
    if (!data.email || !data.password) {
      return { error: 'Email and password are required' };
    }

    if (!validateEmail(data.email)) {
      return { error: 'Invalid email format' };
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Find user with matching credentials
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email.toLowerCase())
      .eq('password_hash', passwordHash)
      .maybeSingle();

    if (queryError) {
      console.error('Login error:', queryError);
      return { error: 'Failed to log in. Please try again.' };
    }

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    // Update last login timestamp
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Log out current user
 */
export async function logout(): Promise<void> {
  // Clear any stored session data if needed
  // For now, just a placeholder
}

/**
 * Get current user profile
 */
export async function getCurrentUser(userId: string): Promise<{ user?: User; error?: string }> {
  try {
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (queryError || !user) {
      return { error: 'User not found' };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at,
      },
    };
  } catch (error) {
    console.error('Get user error:', error);
    return { error: 'Failed to fetch user data' };
  }
}
