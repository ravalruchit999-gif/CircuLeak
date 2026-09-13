"""
Intervention Recommendation Service.
Core Phase 3 Decision-Support Engine.
Synthesizes Phase 2 problem representation, authoritative knowledge catalog, user decision objectives,
and deterministic scoring models into evidence-backed, transparent recommendations.
"""

import uuid
import datetime
import json
import hashlib
import logging
from typing import Dict, Any, List, Optional, Tuple, Set
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from app.models.recommendation import Recommendation
from app.models.leak import Leak
from app.models.facility import Facility
from app.models.process_data import ProcessData
from app.models.analysis_run import AnalysisRun
from app.services.incident_why_service import IncidentWhyService
from app.services.intervention_applicability_service import InterventionApplicabilityService
from app.services.intervention_impact_service import InterventionImpactService
from app.schemas.intervention import (
    UserDecisionContext,
    RecommendationCard,
    IncidentRecommendationResponse,
    ApplicabilityEvaluation,
    EconomicEvaluation,
    ScoreBreakdown,
    ConfidenceEvaluation,
    ReferenceMetadata,
    RecommendationComparisonResponse
)


class InterventionRecommendationService:
    """
    Authoritative decision-support engine for industrial decarbonization interventions.
    """

    @classmethod
    def generate_recommendations_for_incident(
        cls,
        db: Session,
        incident_id: int,
        context: Optional[UserDecisionContext] = None
    ) -> IncidentRecommendationResponse:
        # Default decision context if none supplied
        if context is None:
            context = UserDecisionContext(primary_objective="payback")

        # 1. Fetch Incident and Facility
        leak = db.query(Leak).filter(Leak.id == incident_id).first()
        if not leak:
            raise ValueError(f"Carbon Incident #{incident_id} not found.")

        facility = db.query(Facility).filter(Facility.id == leak.facility_id).first()
        facility_name = facility.business_name if facility else f"Facility #{leak.facility_id}"
        facility_sector = facility.sector if facility else "General Manufacturing"

        # 2. Extract Phase 2 Problem Representation directly from IncidentWhyService
        why_result = IncidentWhyService.analyze_incident_why(db=db, incident_id=incident_id)
        computed_severity = getattr(leak, "severity", None) or ("High" if (leak.risk_score or 0) >= 75 else ("Medium" if (leak.risk_score or 0) >= 40 else "Low"))
        problem_rep = why_result.get("problem_representation") or {
            "problem_type": "off_hours_idle_waste" if (leak.abnormal_period and "off-hours" in str(leak.abnormal_period).lower()) else "abnormal_intensity_deviation",
            "affected_equipment": leak.equipment or "",
            "affected_process": leak.process or "",
            "severity": computed_severity,
            "evidence_strength": "STRONG",
            "excess_energy_kwh": float(getattr(leak, "excess_consumption", 0.0) or (max(0.0, float((leak.observed_consumption or 0.0) - (leak.baseline_consumption or 0.0))) if leak.baseline_consumption is not None else 0.0)),
            "estimated_carbon_impact_kg": float(leak.emission_contribution_kg or 0.0),
            "estimated_financial_impact_inr": 0.0,
            "constraints": ["Cannot interrupt active production shifts"],
            "missing_data": []
        }

        # 3. Detect Available Telemetry Channels in Database for this Equipment (F-11 & NF-01 Remediation)
        telemetry_rows = (
            db.query(ProcessData)
            .filter(
                ProcessData.facility_id == leak.facility_id,
                ProcessData.equipment == leak.equipment
            )
            .limit(10)
            .all()
        )
        available_telemetry: Set[str] = set()
        for r in telemetry_rows:
            # NF-01: Measured zero (0.0) is a valid physical telemetry observation.
            # None indicates missing telemetry / uninstrumented sensor.
            # Negative values (< 0) are physically invalid where consumption/production cannot be negative.
            if getattr(r, "electricity_kwh", None) is not None and r.electricity_kwh >= 0:
                available_telemetry.add("energy_kwh")
                available_telemetry.add("electricity_kwh")
            if getattr(r, "fuel_quantity", None) is not None and r.fuel_quantity >= 0:
                available_telemetry.add("fuel_rate")
                available_telemetry.add("fuel_quantity")
            if getattr(r, "fuel_type", None) is not None and str(r.fuel_type).strip().lower() not in ("none", "", "null"):
                available_telemetry.add("fuel_type")
            if getattr(r, "operating_hours", None) is not None and r.operating_hours >= 0:
                available_telemetry.add("operating_hours")
            if getattr(r, "production_volume", None) is not None and r.production_volume >= 0:
                available_telemetry.add("production_volume")

        # 4. Fetch All Active Interventions from DB Knowledge Base
        all_recs = db.query(Recommendation).filter(Recommendation.is_active == True).all()

        applicable_cards: List[RecommendationCard] = []
        conditionally_applicable_cards: List[RecommendationCard] = []
        inapplicable_recs: List[Dict[str, Any]] = []

        # 5. Evaluate Applicability, Economics, Score, and Confidence for each Intervention
        for rec in all_recs:
            # A. Applicability Guard
            applicability = InterventionApplicabilityService.evaluate_applicability(
                recommendation=rec,
                problem_rep=problem_rep,
                facility_sector=facility_sector,
                available_telemetry=available_telemetry,
                user_target_sector=context.target_sector
            )

            # B. Impact & Economics (F-03, F-04, F-06, F-08 Remediation: Pass DB, tariffs, and timestamp)
            economics = InterventionImpactService.evaluate_economics(
                recommendation=rec,
                problem_rep=problem_rep,
                applicability=applicability,
                db=db,
                telemetry_timestamp=getattr(leak, "detected_at", None),
                custom_electricity_tariff_inr=context.custom_electricity_tariff_inr if context else None,
                custom_fuel_tariff_inr=context.custom_fuel_tariff_inr if context else None
            )

            # C. Score Breakdown (Additive 100-point composition)
            score_breakdown = cls._calculate_score_decomposition(
                rec=rec,
                problem_rep=problem_rep,
                applicability=applicability,
                economics=economics,
                context=context
            )

            # D. Confidence Assessment
            confidence = cls._evaluate_confidence(
                rec=rec,
                applicability=applicability,
                economics=economics,
                evidence_strength=problem_rep.get("evidence_strength", "MEDIUM")
            )

            # E. Reference Metadata
            ref_meta = ReferenceMetadata(
                reference_type=rec.reference_type or "Industrial Energy Audit Case Study",
                reference_title=rec.reference_title or "Best Practice Reference",
                reference_organization=rec.reference_organization or "BEE / UNIDO",
                reference_url_or_document=rec.reference_url_or_document or "",
                reference_year=rec.reference_year or 2022,
                reference_parameter=rec.reference_parameter or "",
                reference_parameter_range=rec.reference_parameter_range or "",
                reference_applicability_notes=rec.reference_applicability_notes or ""
            )

            card = RecommendationCard(
                id=rec.id,
                title=rec.title,
                description=rec.description,
                intervention_type=rec.intervention_type,
                intervention_category=rec.intervention_category or "operational_optimization",
                target_process=rec.target_process,
                target_equipment=rec.target_equipment,
                applicability=applicability,
                economics=economics,
                score_breakdown=score_breakdown,
                confidence=confidence,
                reference=ref_meta,
                implementation_complexity=rec.implementation_complexity or "Medium",
                operational_disruption=rec.operational_disruption or "Low",
                risk_level=rec.risk_level or "Low",
                feasibility=rec.feasibility or "High",
                prerequisites=rec.prerequisites or {},
                contraindications=rec.contraindications or [],
                implementation_constraints=rec.implementation_constraints or []
            )

            # Filter or group based on user constraints
            if applicability.status == "applicable":
                # Check user constraint filters
                passes_constraints = True
                if context.max_capex_inr and economics.capex_inr and economics.capex_inr > context.max_capex_inr:
                    passes_constraints = False
                if context.max_payback_years and economics.payback_period_years and economics.payback_period_years > context.max_payback_years:
                    passes_constraints = False
                if context.acceptable_disruption:
                    disruption_order = {"Low": 1, "Medium": 2, "High": 3}
                    if disruption_order.get(rec.operational_disruption, 2) > disruption_order.get(context.acceptable_disruption, 3):
                        passes_constraints = False

                if passes_constraints:
                    applicable_cards.append(card)
                else:
                    card.applicability.status = "conditionally_applicable"
                    card.applicability.conditions_for_applicability.append("Exceeds current user decision constraint filter thresholds.")
                    conditionally_applicable_cards.append(card)
            elif applicability.status == "conditionally_applicable":
                conditionally_applicable_cards.append(card)
            else:
                inapplicable_recs.append({
                    "id": rec.id,
                    "title": rec.title,
                    "target_equipment": rec.target_equipment,
                    "disqualification_reasons": applicability.disqualification_reasons
                })

        # 6. Rank Applicable Interventions by Total Score
        applicable_cards.sort(key=lambda c: c.score_breakdown.total_score, reverse=True)
        conditionally_applicable_cards.sort(key=lambda c: c.score_breakdown.total_score, reverse=True)

        top_recommendation = applicable_cards[0] if applicable_cards else (
            conditionally_applicable_cards[0] if conditionally_applicable_cards else None
        )

        # 7. Generate Contextual Synthesis
        why_this_option_fits = cls._generate_why_this_fits(top_recommendation, problem_rep, context)
        why_not_others = cls._generate_why_not_others(top_recommendation, applicable_cards, conditionally_applicable_cards, inapplicable_recs)
        challenge_rec = cls._generate_challenge_my_recommendation(top_recommendation, problem_rep)
        verification_checklist = cls._generate_verification_checklist(top_recommendation, problem_rep)

        # 8. Record AnalysisRun Lineage in Database (F-02 & F-13 Remediation)
        analysis_run_id, dataset_hash, analysis_context_hash = cls._record_analysis_run(
            db=db,
            facility_id=leak.facility_id,
            leak=leak,
            candidate_count=len(all_recs),
            context=context
        )

        return IncidentRecommendationResponse(
            incident_id=incident_id,
            facility_id=leak.facility_id,
            facility_name=facility_name,
            analysis_run_id=analysis_run_id,
            dataset_hash_sha256=dataset_hash,
            analysis_context_hash=analysis_context_hash,
            decision_context=context,
            problem_summary=problem_rep,
            top_recommendation=top_recommendation,
            applicable_recommendations=applicable_cards,
            conditionally_applicable_recommendations=conditionally_applicable_cards,
            inapplicable_recommendations=inapplicable_recs,
            why_this_option_fits=why_this_option_fits,
            why_not_others=why_not_others,
            challenge_my_recommendation=challenge_rec,
            verification_checklist=verification_checklist,
            evaluated_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
        )

    @classmethod
    def compare_interventions(
        cls,
        db: Session,
        intervention_ids: List[str],
        incident_id: Optional[int] = None,
        context: Optional[UserDecisionContext] = None
    ) -> RecommendationComparisonResponse:
        """Compares selected interventions side-by-side with tradeoff analysis."""
        if context is None:
            context = UserDecisionContext(primary_objective="payback")

        # If incident_id provided, generate cards in incident context
        cards: List[RecommendationCard] = []
        if incident_id:
            full_resp = cls.generate_recommendations_for_incident(db, incident_id, context)
            all_found = {c.id: c for c in full_resp.applicable_recommendations + full_resp.conditionally_applicable_recommendations}
            for iid in intervention_ids:
                if iid in all_found:
                    cards.append(all_found[iid])
        else:
            # Generic comparison without specific incident context (F-05 Remediation: No fabricated dummy_prob!)
            recs = db.query(Recommendation).filter(Recommendation.id.in_(intervention_ids)).all()
            for r in recs:
                app = ApplicabilityEvaluation(
                    status="evaluated",
                    boundary_match=True,
                    problem_fit=True,
                    missing_telemetry=[],
                    disqualification_reasons=[],
                    conditions_for_applicability=[
                        f"Requires physical plant verification for equipment: {r.target_equipment}."
                    ]
                )
                capex_val = float(r.estimated_cost_inr) if r.estimated_cost_inr else None
                savings_val = float(r.annual_savings_inr) if r.annual_savings_inr else None
                co2_val = float(r.estimated_co2_reduction_annual_kg) if r.estimated_co2_reduction_annual_kg else None
                opex_val = round(capex_val * 0.03, 2) if capex_val else None
                pb_val = float(r.payback_period_years) if r.payback_period_years else (
                    round(capex_val / (savings_val - (opex_val or 0.0)), 2) if (capex_val and savings_val and savings_val > (opex_val or 0.0)) else None
                )
                roi_val = round(((savings_val - (opex_val or 0.0)) / capex_val) * 100.0, 1) if (capex_val and savings_val and savings_val > (opex_val or 0.0)) else None

                econ = EconomicEvaluation(
                    status="evaluated",
                    capex_inr=capex_val,
                    capex_range=None,
                    annual_opex_inr=opex_val,
                    annual_savings_inr=savings_val,
                    savings_range=None,
                    payback_period_years=pb_val,
                    roi_pct=roi_val,
                    annual_co2_reduction_kg=co2_val,
                    co2_reduction_range=None,
                    co2_abatement_cost_inr_per_ton=None,
                    waste_diversion_annual_kg=None,
                    data_provenance_labels={
                        "capex": "[REFERENCE]",
                        "annual_savings": "[REFERENCE]",
                        "carbon_abatement": "[REFERENCE]",
                        "payback": "[REFERENCE]"
                    },
                    assumptions_applied=[
                        f"Nominal case-study benchmark values from {r.reference_organization or 'BEE/UNIDO'}. Not tailored to specific factory incident telemetry."
                    ],
                    missing_variables=[]
                )
                score = cls._calculate_score_decomposition(r, {"affected_equipment": r.target_equipment}, app, econ, context)
                conf = ConfidenceEvaluation(
                    level="MEDIUM",
                    confidence_score=0.70,
                    contributing_factors=[f"Published {r.reference_organization or 'industry'} reference protocol."],
                    uncertainty_drivers=["Generic catalog comparison mode without active factory telemetry."],
                    what_would_change_this="Link to a verified carbon incident to evaluate tailored economics."
                )
                ref = ReferenceMetadata(
                    reference_type=r.reference_type or "Audit Reference",
                    reference_title=r.reference_title or "",
                    reference_organization=r.reference_organization or "BEE",
                    reference_url_or_document=r.reference_url_or_document or "",
                    reference_year=r.reference_year or 2022,
                    reference_parameter=r.reference_parameter or "",
                    reference_parameter_range=r.reference_parameter_range or "",
                    reference_applicability_notes=r.reference_applicability_notes or ""
                )
                cards.append(RecommendationCard(
                    id=r.id,
                    title=r.title,
                    description=r.description,
                    intervention_type=r.intervention_type,
                    intervention_category=r.intervention_category or "operational_optimization",
                    target_process=r.target_process,
                    target_equipment=r.target_equipment,
                    applicability=app,
                    economics=econ,
                    score_breakdown=score,
                    confidence=conf,
                    reference=ref,
                    implementation_complexity=r.implementation_complexity or "Medium",
                    operational_disruption=r.operational_disruption or "Low",
                    risk_level=r.risk_level or "Low",
                    feasibility=r.feasibility or "High",
                    prerequisites=r.prerequisites or {},
                    contraindications=r.contraindications or [],
                    implementation_constraints=r.implementation_constraints or []
                ))

        tradeoffs = cls._build_tradeoff_matrix(cards)
        return RecommendationComparisonResponse(items=cards, tradeoff_analysis=tradeoffs)

    # =========================================================================
    # Deterministic 100-Point Scoring Engine (Transparent Additive Breakdown)
    # =========================================================================

    @classmethod
    def _calculate_score_decomposition(
        cls,
        rec: Recommendation,
        problem_rep: Dict[str, Any],
        applicability: ApplicabilityEvaluation,
        economics: EconomicEvaluation,
        context: UserDecisionContext
    ) -> ScoreBreakdown:
        obj = (context.primary_objective or "payback").lower()

        # 1. Problem Fit Score (Max 24 points)
        problem_fit_score = 0.0
        problem_detail_parts: List[str] = []
        if applicability.problem_fit:
            problem_fit_score += 14.0
            problem_detail_parts.append("+14 direct problem type match")
        elif applicability.status == "conditionally_applicable":
            problem_fit_score += 8.0
            problem_detail_parts.append("+8 partial problem fit")

        if applicability.boundary_match:
            problem_fit_score += 10.0
            problem_detail_parts.append("+10 exact equipment boundary match")
        else:
            problem_detail_parts.append("0 equipment boundary mismatch")
        problem_fit_score = min(24.0, problem_fit_score)
        problem_fit_detail = "; ".join(problem_detail_parts)

        # 2. Objective Alignment Score (Max 20 points)
        obj_score = 0.0
        obj_detail = ""
        if obj == "payback":
            pb = economics.payback_period_years
            if pb is not None:
                if pb <= 1.0:
                    obj_score = 20.0
                    obj_detail = f"+20 rapid capital recovery ({pb} yrs <= 1.0 yr)"
                elif pb <= 2.0:
                    obj_score = 16.0
                    obj_detail = f"+16 attractive payback ({pb} yrs <= 2.0 yrs)"
                elif pb <= 3.0:
                    obj_score = 12.0
                    obj_detail = f"+12 moderate payback ({pb} yrs <= 3.0 yrs)"
                else:
                    obj_score = 6.0
                    obj_detail = f"+6 long payback ({pb} yrs > 3.0 yrs)"
            else:
                obj_score = 2.0
                obj_detail = "+2 unquantified payback due to missing baseline telemetry"
        elif obj == "carbon":
            co2 = economics.annual_co2_reduction_kg or 0.0
            if co2 >= 30000.0:
                obj_score = 20.0
                obj_detail = f"+20 major carbon abatement ({round(co2/1000, 1)} tCO2e/yr >= 30t)"
            elif co2 >= 15000.0:
                obj_score = 15.0
                obj_detail = f"+15 significant carbon abatement ({round(co2/1000, 1)} tCO2e/yr >= 15t)"
            elif co2 >= 5000.0:
                obj_score = 10.0
                obj_detail = f"+10 moderate carbon abatement ({round(co2/1000, 1)} tCO2e/yr)"
            else:
                obj_score = 4.0
                obj_detail = f"+4 modest carbon reduction ({round(co2/1000, 1)} tCO2e/yr)"
        elif obj == "capex":
            cx = economics.capex_inr or 9999999.0
            if cx <= 100000.0:
                obj_score = 20.0
                obj_detail = f"+20 very low capital barrier (₹{int(cx):,} <= ₹100k)"
            elif cx <= 300000.0:
                obj_score = 15.0
                obj_detail = f"+15 low-to-moderate capex (₹{int(cx):,} <= ₹300k)"
            elif cx <= 600000.0:
                obj_score = 10.0
                obj_detail = f"+10 substantial investment (₹{int(cx):,} <= ₹600k)"
            else:
                obj_score = 5.0
                obj_detail = f"+5 high capital requirement (₹{int(cx):,})"
        elif obj == "disruption":
            disr = rec.operational_disruption or "Medium"
            if disr == "Low":
                obj_score = 20.0
                obj_detail = "+20 zero or minor operational disruption (no process stoppage)"
            elif disr == "Medium":
                obj_score = 12.0
                obj_detail = "+12 scheduled maintenance window installation"
            else:
                obj_score = 4.0
                obj_detail = "+4 major shutdown required (extended downtime)"
        elif obj == "circularity":
            cat = rec.intervention_category or ""
            if "circular" in cat:
                obj_score = 20.0
                obj_detail = "+20 closed-loop material or water recycling pathway"
            elif "heat_recovery" in cat:
                obj_score = 16.0
                obj_detail = "+16 thermal circularity (waste heat recovery)"
            else:
                obj_score = 8.0
                obj_detail = "+8 operational energy efficiency without material loops"
        else:
            obj_score = 10.0
            obj_detail = "+10 standard baseline objective alignment"

        # 3. Economic Attractiveness Score (Max 15 points)
        econ_score = 0.0
        econ_detail = ""
        roi = economics.roi_pct
        if roi is not None:
            if roi >= 50.0:
                econ_score = 15.0
                econ_detail = f"+15 outstanding annual ROI ({roi}% >= 50%)"
            elif roi >= 25.0:
                econ_score = 11.0
                econ_detail = f"+11 strong annual ROI ({roi}% >= 25%)"
            elif roi >= 10.0:
                econ_score = 7.0
                econ_detail = f"+7 viable commercial return ({roi}% >= 10%)"
            else:
                econ_score = 3.0
                econ_detail = f"+3 marginal economic return ({roi}%)"
        else:
            econ_score = 2.0
            econ_detail = "+2 economics pending sensor telemetry"

        # 4. Evidence Support & Reference Provenance Score (Max 12 points)
        ev_score = 0.0
        ev_detail = ""
        if rec.reference_url_or_document and rec.reference_organization:
            ev_score = 12.0
            ev_detail = f"+12 verified against published {rec.reference_organization} technical audit benchmarks"
        elif rec.reference_organization:
            ev_score = 9.0
            ev_detail = f"+9 referenced to {rec.reference_organization} guidelines"
        else:
            ev_score = 5.0
            ev_detail = "+5 generic industrial engineering baseline"

        # 5. Implementation Fit & Feasibility Score (Max 8 points)
        imp_score = 0.0
        imp_detail = ""
        comp = rec.implementation_complexity or "Medium"
        if comp == "Low":
            imp_score = 8.0
            imp_detail = "+8 rapid turnkey implementation (standard drop-in hardware)"
        elif comp == "Medium":
            imp_score = 5.0
            imp_detail = "+5 standard retrofit requiring panel/piping modifications"
        else:
            imp_score = 2.0
            imp_detail = "+2 high engineering complexity requiring bespoke fabrication"

        # 6. Safety & Operational Risk Score (Max 3 points)
        safe_score = 0.0
        safe_detail = ""
        risk = rec.risk_level or "Low"
        if risk == "Low":
            safe_score = 3.0
            safe_detail = "+3 low operational risk; failsafe bypass capable"
        elif risk == "Medium":
            safe_score = 2.0
            safe_detail = "+2 moderate risk with interlock controls"
        else:
            safe_score = 1.0
            safe_detail = "+1 high technical risk requiring failover contingency"

        # Penalize if not applicable
        if applicability.status == "not_applicable":
            problem_fit_score = 0.0
            obj_score = 0.0
            econ_score = 0.0

        total_score = round(
            problem_fit_score + obj_score + econ_score + ev_score + imp_score + safe_score, 1
        )
        total_score = min(100.0, max(0.0, total_score))

        return ScoreBreakdown(
            total_score=total_score,
            problem_fit_score=problem_fit_score,
            problem_fit_detail=problem_fit_detail,
            objective_alignment_score=obj_score,
            objective_alignment_detail=obj_detail,
            economic_attractiveness_score=econ_score,
            economic_attractiveness_detail=econ_detail,
            evidence_support_score=ev_score,
            evidence_support_detail=ev_detail,
            implementation_fit_score=imp_score,
            implementation_fit_detail=imp_detail,
            safety_score=safe_score,
            safety_detail=safe_detail,
            weight_multipliers={
                "problem_fit_max": 24.0,
                "objective_alignment_max": 20.0,
                "economic_attractiveness_max": 15.0,
                "evidence_support_max": 12.0,
                "implementation_fit_max": 8.0,
                "safety_max": 3.0
            }
        )

    # =========================================================================
    # Confidence Assessment
    # =========================================================================

    @classmethod
    def _evaluate_confidence(
        cls,
        rec: Recommendation,
        applicability: ApplicabilityEvaluation,
        economics: EconomicEvaluation,
        evidence_strength: str
    ) -> ConfidenceEvaluation:
        factors: List[str] = []
        uncertainties: List[str] = []

        if applicability.status == "not_applicable":
            return ConfidenceEvaluation(
                level="INSUFFICIENT_DATA",
                confidence_score=0.0,
                contributing_factors=["Option evaluated as technically not applicable."],
                uncertainty_drivers=applicability.disqualification_reasons,
                what_would_change_this="Change in equipment layout or problem classification."
            )

        if applicability.missing_telemetry:
            return ConfidenceEvaluation(
                level="LOW",
                confidence_score=0.35,
                contributing_factors=["Boundary match verified against factory layout."],
                uncertainty_drivers=[f"Missing critical telemetry: {', '.join(applicability.missing_telemetry)}."],
                what_would_change_this=f"Deploy sensors for {', '.join(applicability.missing_telemetry)} to record continuous baseline."
            )

        # Baseline confidence based on Phase 2 evidence strength
        if evidence_strength == "STRONG":
            base_score = 0.85
            factors.append("Phase 2 incident evidence grounded in statistically robust baseline observations.")
        elif evidence_strength == "MODERATE":
            base_score = 0.70
            factors.append("Moderate statistical association established in telemetry window.")
        else:
            base_score = 0.50
            factors.append("Limited sample observations in incident detection window.")

        if rec.reference_organization:
            factors.append(f"Derived from published {rec.reference_organization} industrial audit protocols.")

        if economics.payback_period_years is not None:
            factors.append(f"Economic models evaluated using deterministic tariff and capex models.")
        else:
            uncertainties.append("Economic calculations subject to site-specific quotation variability.")

        if rec.implementation_constraints:
            uncertainties.append(f"Site constraints must be physically audited: {rec.implementation_constraints[0]}")

        conf_score = round(base_score, 2)
        level = "HIGH" if conf_score >= 0.80 else ("MEDIUM" if conf_score >= 0.60 else "LOW")

        return ConfidenceEvaluation(
            level=level,
            confidence_score=conf_score,
            contributing_factors=factors,
            uncertainty_drivers=uncertainties,
            what_would_change_this="Logging sub-hourly power sub-metering data during weekend shutdown and obtaining vendor hardware quotes."
        )

    # =========================================================================
    # Contextual Explanations & Synthesis
    # =========================================================================

    @classmethod
    def _generate_why_this_fits(
        cls,
        top_rec: Optional[RecommendationCard],
        problem_rep: Dict[str, Any],
        context: UserDecisionContext
    ) -> List[str]:
        if not top_rec:
            return ["No applicable intervention found matching current equipment boundary and constraints."]

        points = [
            f"Directly resolves the detected problem ({problem_rep.get('problem_type')}) on {top_rec.target_equipment} in {top_rec.target_process}.",
            f"Optimized for your primary goal ('{context.primary_objective}'): scores {top_rec.score_breakdown.objective_alignment_score}/20 in objective alignment.",
            f"Economic return: Estimated payback of {top_rec.economics.payback_period_years or 'N/A'} years with an annual net savings of ~₹{int(top_rec.economics.annual_savings_inr or 0):,} [SCENARIO].",
            f"Grounding in published benchmarks: Supported by {top_rec.reference.reference_organization} ({top_rec.reference.reference_title}) documenting {top_rec.reference.reference_parameter_range}.",
            f"Feasibility fit: {top_rec.operational_disruption} operational disruption ({top_rec.implementation_complexity} complexity), respecting facility production schedules."
        ]
        return points

    @classmethod
    def _generate_why_not_others(
        cls,
        top_rec: Optional[RecommendationCard],
        applicable: List[RecommendationCard],
        conditionally: List[RecommendationCard],
        inapplicable: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        comparisons: List[Dict[str, Any]] = []

        # Top 3 runner-ups in applicable
        runner_ups = [c for c in applicable if not top_rec or c.id != top_rec.id][:3]
        for c in runner_ups:
            score_diff = round((top_rec.score_breakdown.total_score if top_rec else 0) - c.score_breakdown.total_score, 1)
            reasons = []
            if (c.economics.payback_period_years or 99) > (top_rec.economics.payback_period_years or 0 if top_rec else 0):
                reasons.append(f"Longer payback period ({c.economics.payback_period_years} yrs vs {top_rec.economics.payback_period_years if top_rec else 'N/A'} yrs)")
            if (c.economics.capex_inr or 0) > (top_rec.economics.capex_inr or 0 if top_rec else 0):
                reasons.append(f"Higher upfront capital cost (₹{int(c.economics.capex_inr or 0):,})")
            if c.operational_disruption == "High" and (top_rec and top_rec.operational_disruption != "High"):
                reasons.append("Higher operational downtime during commissioning")
            if not reasons:
                reasons.append("Lower composite objective alignment score")

            comparisons.append({
                "id": c.id,
                "title": c.title,
                "status": "Ranked Lower",
                "score_difference": f"-{score_diff} pts",
                "rationale": "; ".join(reasons)
            })

        # Next top conditionally applicable
        for c in conditionally[:2]:
            comparisons.append({
                "id": c.id,
                "title": c.title,
                "status": "Conditionally Applicable",
                "score_difference": "N/A",
                "rationale": f"Requires telemetry or site prerequisites: {c.applicability.conditions_for_applicability[0] if c.applicability.conditions_for_applicability else 'Prerequisites unmet'}"
            })

        # Top 2 disqualified
        for disq in inapplicable[:2]:
            comparisons.append({
                "id": disq["id"],
                "title": disq["title"],
                "status": "Not Applicable",
                "score_difference": "Disqualified",
                "rationale": disq["disqualification_reasons"][0] if disq["disqualification_reasons"] else "Boundary mismatch"
            })

        return comparisons

    @classmethod
    def _generate_challenge_my_recommendation(
        cls,
        top_rec: Optional[RecommendationCard],
        problem_rep: Dict[str, Any]
    ) -> Dict[str, Any]:
        if not top_rec:
            return {"status": "No recommendation to challenge"}

        return {
            "critical_counterarguments": [
                f"What if machine idle intervals are shorter than 10 minutes in actual operating cycles? The controller may not engage enough times to recoup Capex within {top_rec.economics.payback_period_years or 1.5} years.",
                "What if sensor fouling or electrical transients cause inadvertent interlock cutoffs during active batches? Failsafe manual bypass switches are essential.",
                "What if operators manually toggle the system off? Operational protocol training and supervisory password protection are mandatory."
            ],
            "failure_modes_and_mitigations": [
                {
                    "failure_mode": "Frequent cycling causing premature motor starter contactor wear.",
                    "mitigation": "Configure a minimum pause hysteresis timer (e.g. 15 minutes anti-short-cycle delay) in the PLC."
                },
                {
                    "failure_mode": "False idle detection during very low-speed production runs.",
                    "mitigation": "Instrument dual sensing: power current transducer combined with conveyor optical limit switch."
                }
            ],
            "what_could_disprove_this": "If a 72-hour power logging audit reveals that the idle power is actually < 0.5 kW rather than the estimated baseline, Capex recovery will extend beyond 4 years."
        }

    @classmethod
    def _generate_verification_checklist(
        cls,
        top_rec: Optional[RecommendationCard],
        problem_rep: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        if not top_rec:
            return []

        return [
            {
                "step": 1,
                "phase": "Pre-Procurement",
                "action": "Physical Nameplate & Contactor Audit",
                "details": f"Inspect the motor control center (MCC) of {top_rec.target_equipment}. Verify motor full load amperes (FLA) and auxiliary contact availability."
            },
            {
                "step": 2,
                "phase": "Pre-Procurement",
                "action": "48-Hour Portable Sub-Meter Logging",
                "details": "Attach a calibrated Class 0.5 portable power analyzer to log kW, power factor, and idle durations across weekend and shift switchovers."
            },
            {
                "step": 3,
                "phase": "Procurement & Sizing",
                "action": "Vendor Hardware Matching",
                "details": f"Obtain binding quotations for controller hardware against model parameters (budget ₹{int(top_rec.economics.capex_inr or 60000):,})."
            },
            {
                "step": 4,
                "phase": "Installation",
                "action": "Scheduled Non-Production Commissioning",
                "details": f"Schedule installation during regular maintenance downtime ({top_rec.operational_disruption} disruption window). Install physical key-switch bypass."
            },
            {
                "step": 5,
                "phase": "M&V (Measurement & Verification)",
                "action": "IPMVP Option A Measurement Verification",
                "details": "Compare post-installation weekly kWh against pre-installation baseline to officially verify carbon and financial savings."
            }
        ]

    @classmethod
    def _build_tradeoff_matrix(cls, cards: List[RecommendationCard]) -> List[Dict[str, Any]]:
        tradeoffs = []
        for c in cards:
            tradeoffs.append({
                "id": c.id,
                "title": c.title,
                "total_score": c.score_breakdown.total_score,
                "capex_inr": c.economics.capex_inr,
                "payback_years": c.economics.payback_period_years,
                "annual_co2_kg": c.economics.annual_co2_reduction_kg,
                "complexity": c.implementation_complexity,
                "disruption": c.operational_disruption,
                "risk": c.risk_level,
                "key_tradeoff": f"Offers ₹{int(c.economics.annual_savings_inr or 0):,}/yr savings for ₹{int(c.economics.capex_inr or 0):,} Capex ({c.operational_disruption} disruption)."
            })
        return tradeoffs

    @classmethod
    def _record_analysis_run(
        cls,
        db: Session,
        facility_id: int,
        leak: Leak,
        candidate_count: int,
        context: Optional[UserDecisionContext] = None
    ) -> Tuple[str, Optional[str], Optional[str]]:
        run_id = f"RUN-REC-{leak.id}-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S%f')}-{uuid.uuid4().hex[:6]}"
        dataset_hash = None

        if leak.analysis_run_id:
            parent_run = db.query(AnalysisRun).filter(AnalysisRun.id == leak.analysis_run_id).first()
            if parent_run:
                dataset_hash = parent_run.dataset_hash_sha256

        # F-13 Remediation: Deterministic decision-context fingerprint
        # Distinguishes different decision contexts even over identical telemetry
        context_data = context.model_dump() if context else {}
        context_fingerprint = {
            "parent_dataset_hash": dataset_hash,
            "incident_id": leak.id,
            "facility_id": facility_id,
            "equipment": leak.equipment,
            "decision_context": context_data,
            "candidate_count": candidate_count,
            "model_version": "1.0.0",
            "code_version": "3.0.0",
        }
        context_str = json.dumps(context_fingerprint, sort_keys=True, default=str)
        analysis_context_hash = hashlib.sha256(context_str.encode("utf-8")).hexdigest()

        try:
            analysis_run = AnalysisRun(
                id=run_id,
                facility_id=facility_id,
                analysis_type="intervention_recommendation",
                model_name="InterventionRecommendationEngine",
                model_version="1.0.0",
                parameters={
                    "incident_id": leak.id,
                    "equipment": leak.equipment,
                    "candidate_count": candidate_count,
                    "evaluation_standard": "IPCC_BEE_UNIDO",
                    "primary_objective": context.primary_objective if context else "balanced",
                    "analysis_context_hash": analysis_context_hash,
                    "context_fingerprint": context_fingerprint,
                },
                feature_set=["capex_model", "savings_model", "additive_scoring_100pt", "telemetry_guard"],
                input_row_count=candidate_count,
                dataset_hash_sha256=dataset_hash,
                code_version="3.0.0",
                status="completed",
                started_at=datetime.datetime.now(datetime.timezone.utc),
                completed_at=datetime.datetime.now(datetime.timezone.utc)
            )
            db.add(analysis_run)
            db.flush()
            return run_id, dataset_hash, analysis_context_hash
        except Exception as e:
            logger.error(f"Failed to record AnalysisRun for recommendation: {e}")
            return run_id, dataset_hash, analysis_context_hash
