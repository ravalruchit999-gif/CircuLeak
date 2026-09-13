import React from 'react';
import { AlertTriangle, RefreshCw, UploadCloud } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export function ErrorState({
  title = 'API Communication Error',
  message = 'Unable to connect to the FastAPI intelligence service.',
  onRetry,
  className = '',
}) {
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
            <Link to="/data-upload">
              <Button
                variant="outline"
                size="sm"
                icon={UploadCloud}
                className="border-[#2b364c] text-slate-300 hover:bg-slate-800"
              >
                Upload Operational Telemetry
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
