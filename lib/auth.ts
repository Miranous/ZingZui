/**
 * Authentication Utilities
 *
 * Provides secure authentication using Supabase's built-in auth system
 */

import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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
 * Sign up a new user using Supabase Auth
 */
export async function signup(data: SignupData): Promise<{ user?: User; error?: string }> {
  try {
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      return { error: 'All fields are required' };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    });

    if (authError) {
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: 'Failed to create account' };
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Log in an existing user using Supabase Auth
 */
export async function login(data: LoginData): Promise<{ user?: User; error?: string }> {
  try {
    if (!data.email || !data.password) {
      return { error: 'Email and password are required' };
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: 'Invalid email or password' };
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .maybeSingle();

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
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
  await supabase.auth.signOut();
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<{ user?: User; error?: string }> {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return { error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    return {
      user: {
        id: authUser.id,
        email: authUser.email!,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
      },
    };
  } catch (error) {
    console.error('Get user error:', error);
    return { error: 'Failed to fetch user data' };
  }
}
