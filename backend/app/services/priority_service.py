from typing import List, Dict, Any
from sqlalchemy.orm import Session
try:
    from app.services.recommendation_service import RecommendationService
except (ImportError, ModuleNotFoundError):
    from .recommendation_service import RecommendationService


class PriorityService:
    @staticmethod
    def rank_interventions(db: Session, facility_id: int) -> Dict[str, Any]:
        """
        Rank circular interventions using multi-criteria priority scoring:
        Score = w1*(CO2 Impact) + w2*(Payback Speed) + w3*(Annual Savings) + w4*(Feasibility)
        """
        recs = RecommendationService.get_facility_recommendations(db, facility_id)
        if not recs:
            return {"facility_id": facility_id, "ranked_interventions": []}

        # Normalize metrics for fair scoring
        max_co2 = max(r["estimated_co2_reduction_annual_kg"] for r in recs) or 1.0
        max_savings = max(r["annual_savings_inr"] for r in recs) or 1.0

        feasibility_weights = {"High": 1.0, "Medium": 0.70, "Low": 0.40}

        ranked_items = []
        for r in recs:
            # Normalized components (0 to 1)
            norm_co2 = r["estimated_co2_reduction_annual_kg"] / max_co2
            norm_savings = r["annual_savings_inr"] / max_savings
            # Payback score: faster payback (< 1 yr) gets higher score
            payback = max(r["payback_period_years"], 0.1)
            norm_payback = max(0.0, min(1.0, (5.0 - payback) / 5.0))
            norm_feasibility = feasibility_weights.get(r["feasibility"], 0.7)

            # Composite Priority Score (0 - 100)
            composite_score = (
                0.35 * norm_co2 +
                0.30 * norm_payback +
                0.20 * norm_savings +
                0.15 * norm_feasibility
            ) * 100.0

            rationale = (
                f"Offers {r['estimated_co2_reduction_annual_kg']:,.0f} kg CO2e reduction with "
                f"rapid {r['payback_period_years']} yr payback and ₹{r['annual_savings_inr']:,.0f}/yr recurring savings."
            )

            ranked_items.append({
                "recommendation_id": r["id"],
                "recommendation": r["title"],
                "intervention_type": r["intervention_type"],
                "target_equipment": r["target_equipment"],
                "co2_reduction": r["estimated_co2_reduction_annual_kg"],
                "investment": r["estimated_cost_inr"],
                "annual_savings": r["annual_savings_inr"],
                "payback_years": r["payback_period_years"],
                "feasibility": r["feasibility"],
                "priority_score": round(composite_score, 1),
                "rationale": rationale
            })

        # Sort by priority score descending
        ranked_items.sort(key=lambda x: x["priority_score"], reverse=True)

        for rank, item in enumerate(ranked_items, start=1):
            item["priority_rank"] = rank

        return {
            "facility_id": facility_id,
            "ranked_interventions": ranked_items
        }
