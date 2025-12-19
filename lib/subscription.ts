export type SubscriptionTier = 'free' | 'premium' | 'pro';

export interface FeatureLimits {
  maxNotes: number | null;
  maxTasksPerNote: number | null;
  canUseVoiceInput: boolean;
  canUseCustomThemes: boolean;
  canExportNotes: boolean;
  canUseAdvancedFormatting: boolean;
  canUseCloudBackup: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, FeatureLimits> = {
  free: {
    maxNotes: 50,
    maxTasksPerNote: 10,
    canUseVoiceInput: false,
    canUseCustomThemes: false,
    canExportNotes: false,
    canUseAdvancedFormatting: false,
    canUseCloudBackup: true,
  },
  premium: {
    maxNotes: 500,
    maxTasksPerNote: 50,
    canUseVoiceInput: true,
    canUseCustomThemes: true,
    canExportNotes: true,
    canUseAdvancedFormatting: true,
    canUseCloudBackup: true,
  },
  pro: {
    maxNotes: null,
    maxTasksPerNote: null,
    canUseVoiceInput: true,
    canUseCustomThemes: true,
    canExportNotes: true,
    canUseAdvancedFormatting: true,
    canUseCloudBackup: true,
  },
};

export const TIER_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  premium: 'Premium',
  pro: 'Pro',
};

export const TIER_PRICES: Record<Exclude<SubscriptionTier, 'free'>, { monthly: string; yearly: string }> = {
  premium: {
    monthly: '$4.99',
    yearly: '$49.99',
  },
  pro: {
    monthly: '$9.99',
    yearly: '$99.99',
  },
};

export function getTierLimits(tier: SubscriptionTier): FeatureLimits {
  return TIER_LIMITS[tier];
}

export function hasFeature(tier: SubscriptionTier, feature: keyof FeatureLimits): boolean {
  const limits = getTierLimits(tier);
  const value = limits[feature];

  if (typeof value === 'boolean') {
    return value;
  }

  return true;
}

export function canCreateNote(tier: SubscriptionTier, currentNoteCount: number): boolean {
  const limits = getTierLimits(tier);
  if (limits.maxNotes === null) return true;
  return currentNoteCount < limits.maxNotes;
}

export function canAddTask(tier: SubscriptionTier, currentTaskCount: number): boolean {
  const limits = getTierLimits(tier);
  if (limits.maxTasksPerNote === null) return true;
  return currentTaskCount < limits.maxTasksPerNote;
}

export function isUpgradeRequired(tier: SubscriptionTier, feature: keyof FeatureLimits): boolean {
  return !hasFeature(tier, feature);
}
