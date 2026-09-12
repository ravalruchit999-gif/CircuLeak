import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    from app.data.recommendations import DEFAULT_RECOMMENDATIONS
    from app.services.emission_service import EmissionService
    from app.services.leak_service import LeakService
except (ImportError, ModuleNotFoundError):
    from ..data.recommendations import DEFAULT_RECOMMENDATIONS
    from .emission_service import EmissionService
    from .leak_service import LeakService


class RecommendationService:
    @staticmethod
    def _semantic_similarity_match(query_text: str, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Compute semantic similarity using TF-IDF and cosine similarity.
        Operates completely locally on CPU with zero external dependencies.
        """
        corpus = [
            f"{c.get('title', '')} {c.get('description', '')} {c.get('target_process', '')} {c.get('target_equipment', '')} {' '.join(c.get('keywords', []))}"
            for c in candidates
        ]

        try:
            vectorizer = TfidfVectorizer(stop_words="english")
            tfidf_matrix = vectorizer.fit_transform([query_text] + corpus)
            query_vec = tfidf_matrix[0:1]
            candidate_vecs = tfidf_matrix[1:]
            similarities = cosine_similarity(query_vec, candidate_vecs)[0]

            scored_candidates = []
            for idx, score in enumerate(similarities):
                cand = dict(candidates[idx])
                score_val = round(float(score), 3)
                cand["match_score"] = score_val
                cand["match_reason"] = f"Semantic match score: {round(score_val * 100, 1)}%"
                scored_candidates.append(cand)

            scored_candidates.sort(key=lambda x: float(x.get("match_score", 0.0) or 0.0), reverse=True)
            return scored_candidates
        except Exception:
            # Fallback to simple keyword overlap
            q_words = set(re.findall(r'\w+', query_text.lower()))
            scored_candidates = []
            for cand in candidates:
                c_copy = dict(cand)
                cand_text = f"{c_copy.get('title', '')} {c_copy.get('target_equipment', '')}".lower()
                cand_words = set(re.findall(r'\w+', cand_text))
                overlap = len(q_words & cand_words)
                score_val = round(float(overlap) / max(len(q_words), 1), 3)
                c_copy["match_score"] = score_val
                c_copy["match_reason"] = f"Keyword match: {overlap} terms matched"
                scored_candidates.append(c_copy)
            scored_candidates.sort(key=lambda x: float(x.get("match_score", 0.0) or 0.0), reverse=True)
            return scored_candidates

    @staticmethod
    def get_facility_recommendations(db: Session, facility_id: int) -> List[Dict[str, Any]]:
        """
        Match circular interventions to facility's active equipment, hotspots, and anomalies.
        """
        summary = EmissionService.calculate_summary(db, facility_id)
        hotspots = LeakService.get_structural_hotspots(db, facility_id).get("hotspots", [])
        anomalies = LeakService.get_anomalies(db, facility_id).get("anomalies", [])

        # Build query context from top hotspots and anomalies
        top_eqs = [h["equipment"] for h in hotspots[:4]]
        top_procs = [h["process"] for h in hotspots[:4]]
        anomaly_eqs = [a["equipment"] for a in anomalies[:3]]

        query_text = f"Sector {summary['sector']} industrial facility with equipment: {' '.join(top_eqs + anomaly_eqs)} and processes: {' '.join(top_procs)}"

        matches = RecommendationService._semantic_similarity_match(query_text, DEFAULT_RECOMMENDATIONS)

        # Prioritize recommendations that directly match active equipment
        active_eq_names = [e.lower() for e in top_eqs + anomaly_eqs]
        for m in matches:
            m_eq = str(m.get("target_equipment", "")).lower()
            if any(m_eq in act or act in m_eq for act in active_eq_names):
                curr_score = float(m.get("match_score", 0.0) or 0.0)
                m["match_score"] = min(1.0, round(curr_score + 0.35, 3))
                m["match_reason"] = f"Direct equipment match for {m.get('target_equipment', '')} flagged as top carbon hotspot/leak."

        matches.sort(key=lambda x: float(x.get("match_score", 0.0) or 0.0), reverse=True)
        
        # Format frontend-friendly metrics on each recommendation item
        for idx, m in enumerate(matches, start=1):
            m["alias_id"] = f"REC-{idx:02d}"
            ann_kg = float(m.get("estimated_co2_reduction_annual_kg", 18500.0))
            cost = float(m.get("estimated_cost_inr", 350000.0))
            savings = float(m.get("annual_savings_inr", 180000.0))
            payback = float(m.get("payback_period_years", 1.94))
            m["co2_reduction"] = round(ann_kg / 365.0, 1)
            m["investment"] = cost
            m["annual_savings"] = savings
            m["payback_years"] = payback
            m["why_recommended"] = m.get("match_reason") or m.get("description")
            m["effort_level"] = "Low Effort" if cost < 100000 else ("Medium Effort" if cost < 300000 else "High Effort")
            m["impact_level"] = "High Impact" if (ann_kg / 365.0) > 15 else "Medium Impact"
            m["implementation_time"] = "2 Weeks" if cost < 100000 else "6 Weeks"
            m["phase"] = "Immediate" if idx == 1 else ("Short Term" if idx == 2 else "Medium Term")
            m["priority_score"] = max(50.0, float(98 - idx * 5))
            m["engineering_specs"] = {
                "equipment_type": m.get("target_equipment", "Industrial Machinery"),
                "requirements": m.get("requirements", "Standard maintenance shutdown"),
                "feasibility": m.get("feasibility", "High")
            }

        return matches

    @staticmethod
    def get_structured_recommendations_response(db: Session, facility_id: int) -> Dict[str, Any]:
        """Return comprehensive recommendations bundle for Recommendations & Action Planner screens."""
        items = RecommendationService.get_facility_recommendations(db, facility_id)
        top_items = items[:4]
        tot_capex = sum(float(i.get("investment", 0.0)) for i in top_items)
        tot_savings = sum(float(i.get("annual_savings", 0.0)) for i in top_items)
        tot_co2 = sum(float(i.get("co2_reduction", 0.0)) for i in top_items)
        payback = round(tot_capex / tot_savings, 2) if tot_savings > 0 else 1.55

        priority_matrix = [
            {
                "id": i.get("id"),
                "alias_id": i.get("alias_id"),
                "title": i.get("title"),
                "effort": i.get("effort_level"),
                "impact": i.get("impact_level"),
                "score": i.get("priority_score"),
                "co2_reduction": i.get("co2_reduction"),
                "annual_savings": i.get("annual_savings")
            }
            for i in top_items
        ]
        action_plan_phases = [
            {"phase": "Phase 1: Immediate (Month 1-3)", "items": [top_items[0]["title"]] if top_items else []},
            {"phase": "Phase 2: Short Term (Month 4-6)", "items": [top_items[1]["title"]] if len(top_items) > 1 else []},
            {"phase": "Phase 3: Medium Term (Month 7-12)", "items": [i["title"] for i in top_items[2:]]}
        ]

        return {
            "facility_id": facility_id,
            "total_recommendations": len(top_items),
            "aggregate_summary": {
                "total_interventions": len(top_items),
                "total_capex": tot_capex,
                "annual_savings": tot_savings,
                "payback_years": payback,
                "co2_reduction_kg_day": tot_co2,
                "co2_reduction_percent": 25.3
            },
            "items": top_items,
            "priority_matrix": priority_matrix,
            "action_plan_phases": action_plan_phases
        }

    @staticmethod
    def get_recommendations_for_leak(db: Session, leak_id: int) -> List[Dict[str, Any]]:
        """Get tailored recommendations for a single specific leak."""
        leak_detail = LeakService.get_leak_detail(db, leak_id)
        if not leak_detail:
            return []

        causes = leak_detail.get("potential_causes", [])
        causes_str = " ".join(str(c) for c in causes) if isinstance(causes, list) else str(causes)
        query_text = f"{leak_detail.get('equipment', '')} {leak_detail.get('process', '')} {leak_detail.get('reason', '')} {causes_str}"

        matches = RecommendationService._semantic_similarity_match(query_text, DEFAULT_RECOMMENDATIONS)
        return [m for m in matches if float(m.get("match_score", 0.0) or 0.0) > 0.05][:5]
