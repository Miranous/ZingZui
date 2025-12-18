import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { GlassCard } from '../../components/GlassCard';
import { ThemedButton } from '../../components/ThemedButton';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <LinearGradient
      colors={theme.palette.backgroundGradient}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>
            {user?.firstName} {user?.lastName}
          </Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </GlassCard>

        <ThemedButton
          title="Log out"
          onPress={handleLogout}
          variant="secondary"
          style={styles.logoutButton}
        />
        <View style={styles.footer}>
          <Text style={styles.version}>ZingZui Free Version (Release 1.0.0)</Text>
          <Text style={styles.supportLabel}>Support: Enquiries@Dalatek.com</Text>
          <Text style={styles.copyright}>
            Copyright © Dalatek LLC All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xl,
    paddingTop: 120,
  },
  title: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.xxxl,
  },
  card: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  label: {
    ...theme.typography.caption,
    color: theme.palette.textSecondary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.lg,
  },
  value: {
    ...theme.typography.body,
    color: theme.palette.textPrimary,
  },
  logoutButton: {
    marginTop: theme.spacing.lg,
  },
  footer: {
    marginTop: theme.spacing.xxxl,
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  version: {
    ...theme.typography.caption,
    color: theme.palette.textSecondary,
    marginBottom: theme.spacing.md,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  supportLabel: {
    ...theme.typography.caption,
    color: theme.palette.textSecondary,
  },
  supportEmail: {
    ...theme.typography.caption,
    color: theme.palette.primaryGradient[0],
    textDecorationLine: 'underline',
  },
  copyright: {
    ...theme.typography.caption,
    color: theme.palette.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
