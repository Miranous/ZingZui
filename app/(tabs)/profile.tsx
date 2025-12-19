import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Crown, Sparkles } from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard';
import { ThemedButton } from '../../components/ThemedButton';
import { UpgradePromptModal } from '../../components/UpgradePromptModal';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { TIER_NAMES } from '../../lib/subscription';
import { theme } from '../../theme/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { tier, limits } = useSubscription();
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

        <GlassCard style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View style={styles.tierBadge}>
              {tier === 'free' ? (
                <Sparkles size={20} color={theme.palette.textSecondary} />
              ) : (
                <Crown size={20} color={theme.palette.primaryGradient[0]} />
              )}
              <Text style={[
                styles.tierText,
                tier !== 'free' && styles.tierTextPremium
              ]}>
                {TIER_NAMES[tier]}
              </Text>
            </View>
          </View>

          <View style={styles.limitsContainer}>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>Notes</Text>
              <Text style={styles.limitValue}>
                {limits.maxNotes === null ? 'Unlimited' : `Up to ${limits.maxNotes}`}
              </Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>Tasks per Note</Text>
              <Text style={styles.limitValue}>
                {limits.maxTasksPerNote === null ? 'Unlimited' : `Up to ${limits.maxTasksPerNote}`}
              </Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>Voice Input</Text>
              <Text style={styles.limitValue}>
                {limits.canUseVoiceInput ? 'Enabled' : 'Not Available'}
              </Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>Custom Themes</Text>
              <Text style={styles.limitValue}>
                {limits.canUseCustomThemes ? 'Enabled' : 'Not Available'}
              </Text>
            </View>
          </View>

          {tier === 'free' && (
            <ThemedButton
              title="Upgrade to Premium"
              onPress={() => setShowUpgradeModal(true)}
              variant="primary"
              style={styles.upgradeButton}
            />
          )}
        </GlassCard>

        <ThemedButton
          title="Log out"
          onPress={handleLogout}
          variant="secondary"
          style={styles.logoutButton}
        />

        <UpgradePromptModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="Premium Features"
          requiredTier="premium"
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
  subscriptionCard: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  subscriptionHeader: {
    marginBottom: theme.spacing.lg,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  tierText: {
    ...theme.typography.subheadline,
    color: theme.palette.textSecondary,
  },
  tierTextPremium: {
    color: theme.palette.primaryGradient[0],
    fontWeight: '700',
  },
  limitsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitLabel: {
    ...theme.typography.body,
    color: theme.palette.textSecondary,
  },
  limitValue: {
    ...theme.typography.body,
    color: theme.palette.textPrimary,
    fontWeight: '600',
  },
  upgradeButton: {
    marginTop: theme.spacing.md,
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
