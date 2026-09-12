import pytest
from app.data.recommendations import DEFAULT_RECOMMENDATIONS
from app.services.recommendation_service import RecommendationService


def test_recommendation_library_validity():
    """Verify curated recommendations have valid numbers, ROI, and feasibility."""
    assert len(DEFAULT_RECOMMENDATIONS) >= 10
    for r in DEFAULT_RECOMMENDATIONS:
        assert r["estimated_co2_reduction_annual_kg"] > 0
        assert r["estimated_cost_inr"] > 0
        assert r["annual_savings_inr"] > 0
        assert r["payback_period_years"] > 0
        assert r["feasibility"] in ["High", "Medium", "Low"]


def test_semantic_matching_on_boiler():
    """Verify semantic matching pairs boiler equipment with WHR or economizer interventions."""
    matches = RecommendationService._semantic_similarity_match(
        "Industrial coal-fired steam boiler with high flue gas exhaust temperature",
        DEFAULT_RECOMMENDATIONS
    )
    assert len(matches) > 0
    top_match = matches[0]
    # Should match boiler flue WHR or biomass fuel switching
    assert "boiler" in top_match["target_equipment"].lower() or "furnace" in top_match["target_equipment"].lower()
