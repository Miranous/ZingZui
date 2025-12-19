import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Crown, Check } from 'lucide-react-native';
import { THEME } from '@/theme/theme';
import { SubscriptionTier, TIER_NAMES, TIER_PRICES, TIER_LIMITS } from '@/lib/subscription';

interface UpgradePromptModalProps {
  visible: boolean;
  onClose: () => void;
  feature: string;
  requiredTier: Exclude<SubscriptionTier, 'free'>;
}

export function UpgradePromptModal({
  visible,
  onClose,
  feature,
  requiredTier,
}: UpgradePromptModalProps) {
  const tierLimits = TIER_LIMITS[requiredTier];
  const tierName = TIER_NAMES[requiredTier];
  const pricing = TIER_PRICES[requiredTier];

  const features = [
    tierLimits.maxNotes === null
      ? 'Unlimited notes'
      : `Up to ${tierLimits.maxNotes} notes`,
    tierLimits.maxTasksPerNote === null
      ? 'Unlimited tasks per note'
      : `Up to ${tierLimits.maxTasksPerNote} tasks per note`,
    tierLimits.canUseVoiceInput && 'Voice input',
    tierLimits.canUseCustomThemes && 'Custom themes',
    tierLimits.canExportNotes && 'Export notes',
    tierLimits.canUseAdvancedFormatting && 'Advanced formatting',
    tierLimits.canUseCloudBackup && 'Cloud backup & sync',
  ].filter(Boolean) as string[];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={THEME.colors.text.primary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Crown size={40} color={THEME.colors.accent} />
              </View>
              <Text style={styles.title}>Upgrade to {tierName}</Text>
              <Text style={styles.subtitle}>
                {feature} is available in {tierName}
              </Text>
            </View>

            <ScrollView style={styles.content}>
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Included Features:</Text>
                {features.map((feat, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Check size={20} color={THEME.colors.accent} />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.pricingContainer}>
                <View style={styles.priceOption}>
                  <Text style={styles.priceLabel}>Monthly</Text>
                  <Text style={styles.priceValue}>{pricing.monthly}</Text>
                  <Text style={styles.priceSubtext}>per month</Text>
                </View>
                <View style={[styles.priceOption, styles.priceOptionRecommended]}>
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Best Value</Text>
                  </View>
                  <Text style={styles.priceLabel}>Yearly</Text>
                  <Text style={styles.priceValue}>{pricing.yearly}</Text>
                  <Text style={styles.priceSubtext}>per year</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => {
                  onClose();
                }}
              >
                <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: '80%',
  },
  modal: {
    backgroundColor: THEME.colors.background.tertiary,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border.primary,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border.primary,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: THEME.colors.text.primary,
    flex: 1,
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceOption: {
    flex: 1,
    padding: 20,
    backgroundColor: THEME.colors.background.secondary,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 2,
    borderColor: THEME.colors.border.primary,
    alignItems: 'center',
  },
  priceOptionRecommended: {
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.background.primary,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.md,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.background.primary,
  },
  priceLabel: {
    fontSize: 14,
    color: THEME.colors.text.secondary,
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.colors.text.primary,
    marginBottom: 4,
  },
  priceSubtext: {
    fontSize: 12,
    color: THEME.colors.text.secondary,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: THEME.colors.accent,
    paddingVertical: 16,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: THEME.colors.background.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: THEME.colors.text.secondary,
    fontSize: 16,
  },
});
