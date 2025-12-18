/**
 * Signup Screen
 *
 * Provides user registration with Liquid Glass UI
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
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { GlassCard } from '../../components/GlassCard';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedInput } from '../../components/ThemedInput';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignup = async () => {
    setError('');
    setIsLoading(true);

    const result = await signup(email, password, firstName, lastName);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setShowSuccess(true);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    }
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  const isFormValid = firstName && lastName && email && password;

  return (
    <ImageBackground
      source={require('../../assets/images/image copy.png')}
      style={styles.container}
      resizeMode="cover"
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
            <Text style={styles.title}>Create an account</Text>
            <Text style={styles.subtitle}>Join us to get started</Text>

            <GlassCard style={styles.card}>
              {showSuccess ? (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  style={styles.successContainer}
                >
                  <Text style={styles.successText}>✓</Text>
                  <Text style={styles.successMessage}>
                    Account created — welcome!
                  </Text>
                </Animated.View>
              ) : (
                <>
                  {error ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <View style={styles.nameRow}>
                    <ThemedInput
                      label="First Name"
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="John"
                      autoCapitalize="words"
                      autoComplete="name-given"
                      containerStyle={styles.nameInput}
                      accessibilityLabel="first-name-input"
                    />
                    <ThemedInput
                      label="Last Name"
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Doe"
                      autoCapitalize="words"
                      autoComplete="name-family"
                      containerStyle={styles.nameInput}
                      accessibilityLabel="last-name-input"
                    />
                  </View>

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
                    placeholder="Create a password"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password-new"
                    accessibilityLabel="password-input"
                  />

                  <Text style={styles.helperText}>
                    Password must be at least 8 characters with uppercase,
                    lowercase, and numbers
                  </Text>

                  <ThemedButton
                    title="Create account"
                    onPress={handleSignup}
                    loading={isLoading}
                    disabled={!isFormValid}
                    style={styles.signupButton}
                    accessibilityLabel="signup-button"
                  />

                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <Pressable onPress={navigateToLogin}>
                      <Text style={styles.loginLink}>Log in</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </GlassCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  successText: {
    fontSize: 48,
    color: theme.palette.success,
    marginBottom: theme.spacing.lg,
  },
  successMessage: {
    ...theme.typography.title,
    color: theme.palette.success,
  },
  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  nameInput: {
    flex: 1,
  },
  helperText: {
    ...theme.typography.caption,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  signupButton: {
    marginTop: theme.spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  loginText: {
    ...theme.typography.bodySmall,
  },
  loginLink: {
    ...theme.typography.bodySmall,
    color: theme.palette.primaryGradient[0],
    fontWeight: '600',
  },
});
