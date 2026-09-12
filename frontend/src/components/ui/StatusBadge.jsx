import React from 'react';
import { Badge } from './Badge';

export function StatusBadge({ status, score = null, className = '' }) {
  if (score !== null) {
    if (score >= 80) {
      return (
        <Badge variant="red" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          Critical ({score})
        </Badge>
      );
    }
    if (score >= 60) {
      return (
        <Badge variant="amber" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          High Risk ({score})
        </Badge>
      );
    }
    if (score >= 40) {
      return (
        <Badge variant="blue" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Medium ({score})
        </Badge>
      );
    }
    return (
      <Badge variant="emerald" className={className}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Low ({score})
      </Badge>
    );
  }

  const normalized = (status || '').toLowerCase();

  // Prioritize anomaly, critical, and leak keywords over generic words like 'active'
  if (
    normalized.includes('critical') ||
    normalized.includes('unresolved') ||
    normalized.includes('leak')
  ) {
    return (
      <Badge variant="red" className={className}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        {status}
      </Badge>
    );
  }

  if (
    normalized.includes('anomaly') ||
    normalized.includes('investigating') ||
    normalized.includes('waste') ||
    normalized.includes('high') ||
    normalized.includes('warning')
  ) {
    return (
      <Badge variant="amber" className={className}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {status}
      </Badge>
    );
  }

  if (
    normalized.includes('optimal') ||
    normalized.includes('verified') ||
    normalized.includes('active production') ||
    normalized === 'active'
  ) {
    return (
      <Badge variant="emerald" className={className}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {status}
      </Badge>
    );
  }

  return <Badge variant="neutral" className={className}>{status}</Badge>;
}
