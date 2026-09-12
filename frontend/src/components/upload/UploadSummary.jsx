import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { SectionCard } from '../ui/SectionCard';

export function UploadSummary({ result, onAnalyze }) {
  if (!result) return null;

  return (
    <SectionCard
      title="Ingestion Confirmation"
      subtitle="Operational data indexed and ready for emission leak diagnosis"
      className="border-emerald-800/60"
    >
      <div className="p-6 rounded bg-[#121c1a] border border-emerald-900/60 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center text-emerald-300 mx-auto">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">
            Data Uploaded Successfully
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            {result.message || 'Operational telemetry records synchronized with facility baseline models.'}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="primary" size="md" icon={Activity}>
              Analyze Facility in Dashboard
            </Button>
          </Link>
          <Link to="/leaks">
            <Button variant="secondary" size="md" icon={ArrowRight}>
              View Carbon Leaks
            </Button>
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
