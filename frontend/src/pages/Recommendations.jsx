import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useRecommendations } from '../hooks/useRecommendations';
import { RecommendationImpact } from '../components/recommendations/RecommendationImpact';
import { RecommendationList } from '../components/recommendations/RecommendationList';
import { PriorityMatrix } from '../components/recommendations/PriorityMatrix';
import { RecommendationDetails } from '../components/recommendations/RecommendationDetails';
import { Button } from '../components/ui/Button';
import { Sliders, ListChecks } from 'lucide-react';

export function Recommendations() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useRecommendations();
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  if (loading) {
    return (
      <div>
        <PageHeader title="Circular Recommendations & Interventions" />
        <LoadingState rows={6} message="Formulating circular alternatives and ROI metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Circular Recommendations & Interventions" />
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  const handleSimulate = (interventionId) => {
    navigate('/simulation');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Circular Alternatives & Engineering Interventions"
        subtitle="Ranked circular solutions formulated to eliminate carbon leaks and optimize thermal & auxiliary efficiency"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            4 Actionable Packages
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to="/action-planner">
              <Button variant="outline" size="sm" icon={ListChecks}>
                Action Roadmap
              </Button>
            </Link>
            <Link to="/simulation">
              <Button variant="primary" size="sm" icon={Sliders}>
                Simulate Returns
              </Button>
            </Link>
          </div>
        }
      />

      {/* Aggregate Impact Cards */}
      <RecommendationImpact data={data} />

      {/* Priority 2x2 Matrix */}
      <PriorityMatrix matrix={data?.priority_matrix} />

      {/* Filterable Candidate List */}
      <RecommendationList
        recommendations={data?.items}
        onSelect={(rec) => setSelectedRecommendation(rec)}
        onSimulate={handleSimulate}
      />

      {/* Engineering Specification Modal */}
      {selectedRecommendation && (
        <RecommendationDetails
          recommendation={selectedRecommendation}
          isOpen={!!selectedRecommendation}
          onClose={() => setSelectedRecommendation(null)}
          onSimulate={handleSimulate}
        />
      )}
    </div>
  );
}
export default Recommendations;
