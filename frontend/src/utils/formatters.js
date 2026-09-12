/**
 * Centralized formatting utilities for CircuLeak
 */

/**
 * Format currency in Indian Rupees (INR) or standard currency format
 * @param {number} amount
 * @param {boolean} compact
 * @returns {string}
 */
export function formatCurrency(amount, compact = false) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';

  if (compact) {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format CO2 emissions with appropriate units
 * @param {number} value in kgCO2e
 * @param {string} preferredUnit 'kg' | 't' | 'auto'
 * @returns {string}
 */
export function formatCO2(value, preferredUnit = 'auto') {
  if (value === null || value === undefined || isNaN(value)) return '0 kgCO₂e';

  if (preferredUnit === 't' || (preferredUnit === 'auto' && Math.abs(value) >= 100000)) {
    const tonnes = value / 1000;
    return `${tonnes.toLocaleString('en-US', { maximumFractionDigits: 1 })} tCO₂e`;
  }

  return `${Math.round(value).toLocaleString('en-US')} kgCO₂e`;
}

/**
 * Format specific emission intensity per metric ton product
 * @param {number} value
 * @returns {string}
 */
export function formatEmissionIntensity(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 kgCO₂e / metric ton product';
  }
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })} kgCO₂e / metric ton product`;
}

/**
 * Format percentage with optional explicit sign
 * @param {number} value
 * @param {boolean} includeSign
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, includeSign = false, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  const prefix = includeSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(decimals)}%`;
}

/**
 * Format payback duration in years
 * @param {number} years
 * @returns {string}
 */
export function formatPayback(years) {
  if (years === null || years === undefined || isNaN(years)) return 'N/A';
  if (years === 0) return 'Immediate';
  return `${years.toFixed(2)} years`;
}

/**
 * Format energy consumption
 * @param {number} kwh
 * @returns {string}
 */
export function formatEnergy(kwh) {
  if (kwh === null || kwh === undefined || isNaN(kwh)) return '0 kWh';
  if (kwh >= 1000) {
    return `${(kwh / 1000).toFixed(1)} MWh`;
  }
  return `${Math.round(kwh).toLocaleString()} kWh`;
}
