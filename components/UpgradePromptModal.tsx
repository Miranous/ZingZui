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
import { theme } from '@/theme/theme';
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
              <X size={24} color={theme.palette.textPrimary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Crown size={40} color={theme.palette.primaryGradient[0]} />
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
                    <Check size={20} color={theme.palette.primaryGradient[0]} />
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
    backgroundColor: theme.palette.glassBg,
    borderRadius: theme.radii.large,
    borderWidth: 1,
    borderColor: theme.palette.glassBorder,
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
    borderBottomColor: theme.palette.glassBorder,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.palette.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.palette.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.palette.textSecondary,
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
    color: theme.palette.textPrimary,
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
    color: theme.palette.textPrimary,
    flex: 1,
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceOption: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.palette.inputBg,
    borderRadius: theme.radii.card,
    borderWidth: 2,
    borderColor: theme.palette.glassBorder,
    alignItems: 'center',
  },
  priceOptionRecommended: {
    borderColor: theme.palette.primaryGradient[0],
    backgroundColor: theme.palette.surfaceTint,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: theme.palette.primaryGradient[0],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radii.input,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.palette.textPrimary,
  },
  priceLabel: {
    fontSize: 14,
    color: theme.palette.textSecondary,
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.palette.textPrimary,
    marginBottom: 4,
  },
  priceSubtext: {
    fontSize: 12,
    color: theme.palette.textSecondary,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: theme.palette.primaryGradient[0],
    paddingVertical: 16,
    borderRadius: theme.radii.card,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: theme.palette.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.palette.textSecondary,
    fontSize: 16,
  },
});
