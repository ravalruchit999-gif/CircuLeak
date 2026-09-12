/**
 * Standard industry labels, units, and textual definitions
 */

export const LABELS = {
  appName: 'CircuLeak',
  tagline: 'Industrial Emission Leak-Point Detector & Circular Alternative Recommender',
  facilityUnit: 'kgCO₂e / metric ton product',
  emissionUnit: 'kgCO₂e',
  emissionUnitTonnes: 'tCO₂e',
  currency: 'INR',
  currencySymbol: '₹',
};

export const RISK_LEVELS = {
  CRITICAL: { label: 'Critical Risk', color: 'red', minScore: 80 },
  HIGH: { label: 'High Risk', color: 'amber', minScore: 60 },
  MEDIUM: { label: 'Medium Risk', color: 'yellow', minScore: 40 },
  LOW: { label: 'Low Risk', color: 'emerald', minScore: 0 },
};

export const OPERATING_STATUS = {
  ACTIVE: { label: 'Active Production', color: 'emerald' },
  INACTIVE: { label: 'Inactive / Off-Hours', color: 'slate' },
  MAINTENANCE: { label: 'Scheduled Maintenance', color: 'blue' },
};
