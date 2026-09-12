/**
 * Number utilities for CircuLeak
 */

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function round(val, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export function calculateDelta(current, baseline) {
  if (!baseline || baseline === 0) return 0;
  return round(((current - baseline) / baseline) * 100, 1);
}
