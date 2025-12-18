/**
 * Login Screen
 *
 * Provides email/password authentication with Liquid Glass UI
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { GlassCard } from '../../components/GlassCard';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedInput } from '../../components/ThemedInput';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme/theme';

export default function LoginScreen() {
  console.log('LoginScreen rendering');
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      // Navigation will be handled by the auth state change
      router.replace('/(tabs)');
    }
  };

  const navigateToSignup = () => {
    router.push('/(auth)/signup');
  };

  return (
    <LinearGradient
      colors={theme.palette.backgroundGradient}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <GlassCard style={styles.card}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <ThemedInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="email-input"
              />

              <ThemedInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                accessibilityLabel="password-input"
              />

              <ThemedButton
                title="Log in"
                onPress={handleLogin}
                loading={isLoading}
                disabled={!email || !password}
                style={styles.loginButton}
                accessibilityLabel="login-button"
              />

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <Pressable onPress={navigateToSignup}>
                  <Text style={styles.signupLink}>Create account</Text>
                </Pressable>
              </View>
            </GlassCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.xxxl,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  errorContainer: {
    backgroundColor: 'rgba(255,90,95,0.15)',
    borderRadius: theme.radii.small,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,90,95,0.3)',
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.palette.danger,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: theme.spacing.lg,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  signupText: {
    ...theme.typography.bodySmall,
  },
  signupLink: {
    ...theme.typography.bodySmall,
    color: theme.palette.primaryGradient[0],
    fontWeight: '600',
  },
});
