import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../components/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme/theme';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <LinearGradient
      colors={theme.palette.backgroundGradient}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome, {user?.firstName}!</Text>
        <Text style={styles.subtitle}>Your notes app is ready</Text>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Get Started</Text>
          <Text style={styles.cardText}>
            Your secure note-taking app is ready to use.
            Start creating your first note!
          </Text>
        </GlassCard>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: 60,
  },
  title: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.xxxl,
  },
  card: {
    width: '100%',
  },
  cardTitle: {
    ...theme.typography.title,
    marginBottom: theme.spacing.md,
  },
  cardText: {
    ...theme.typography.body,
    lineHeight: 24,
  },
});
