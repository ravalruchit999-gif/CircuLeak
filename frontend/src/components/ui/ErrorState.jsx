import React from 'react';
import { AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { Button } from './Button';
import { useFacilityContext } from '../../context/FacilityContext';

export function ErrorState({
  title = 'API Communication Error',
  message = 'Unable to connect to the FastAPI intelligence service.',
  onRetry,
  className = '',
}) {
  const { toggleMockMode } = useFacilityContext();

  return (
    <div className={`p-6 rounded bg-red-950/20 border border-red-900/50 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-2 rounded bg-red-900/30 text-red-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-200 mb-1">{title}</h4>
          <p className="text-xs text-red-300/80 mb-4 max-w-xl font-mono leading-relaxed">
            {message}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {onRetry && (
              <Button variant="secondary" size="sm" onClick={onRetry} icon={RefreshCw}>
                Retry API Request
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleMockMode(true)}
              icon={Database}
              className="border-red-800/60 text-red-200 hover:bg-red-900/20"
            >
              Switch to Offline Demo Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
