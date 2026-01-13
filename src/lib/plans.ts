// Plan configuration and limits
export type PlanType = 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'expired';

export interface PlanLimits {
  maxProducts: number;
  maxTeamMembers: number;
  features: {
    barcodeScanning: boolean;
    basicAnalytics: boolean;
    advancedAnalytics: boolean;
    stockAlerts: boolean;
    csvImportExport: boolean;
    apiAccess: boolean;
    customIntegrations: boolean;
    prioritySupport: boolean;
    dedicatedSupport: boolean;
    slaGuarantee: boolean;
  };
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  starter: {
    maxProducts: 100,
    maxTeamMembers: 1,
    features: {
      barcodeScanning: true,
      basicAnalytics: true,
      advancedAnalytics: false,
      stockAlerts: false,
      csvImportExport: false,
      apiAccess: false,
      customIntegrations: false,
      prioritySupport: false,
      dedicatedSupport: false,
      slaGuarantee: false,
    },
  },
  professional: {
    maxProducts: Infinity,
    maxTeamMembers: 5,
    features: {
      barcodeScanning: true,
      basicAnalytics: true,
      advancedAnalytics: true,
      stockAlerts: true,
      csvImportExport: true,
      apiAccess: false,
      customIntegrations: false,
      prioritySupport: true,
      dedicatedSupport: false,
      slaGuarantee: false,
    },
  },
  enterprise: {
    maxProducts: Infinity,
    maxTeamMembers: Infinity,
    features: {
      barcodeScanning: true,
      basicAnalytics: true,
      advancedAnalytics: true,
      stockAlerts: true,
      csvImportExport: true,
      apiAccess: true,
      customIntegrations: true,
      prioritySupport: true,
      dedicatedSupport: true,
      slaGuarantee: true,
    },
  },
};

export const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

export const PLAN_PRICES: Record<PlanType, { amount: number; display: string }> = {
  starter: { amount: 0, display: 'Free' },
  professional: { amount: 1599, display: '₹1,599/mo' },
  enterprise: { amount: 0, display: 'Custom' },
};

export const TRIAL_DAYS = 14;
