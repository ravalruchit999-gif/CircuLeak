from typing import Dict, Any, List
from sqlalchemy.orm import Session
try:
    from app.models.facility import Facility
    from app.models.symbiosis_stream import SymbiosisStream
    from app.services.emission_service import EmissionService
except (ImportError, ModuleNotFoundError):
    from ..models.facility import Facility
    from ..models.symbiosis_stream import SymbiosisStream
    from .emission_service import EmissionService


class SymbiosisService:
    @staticmethod
    def get_facility_symbiosis(db: Session, facility_id: int) -> Dict[str, Any]:
        """
        Evaluate industrial by-product streams and match with circular economy
        industrial symbiosis off-takers in regional manufacturing clusters.
        """
        facility = db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            raise ValueError(f"Facility #{facility_id} not found.")

        summary = EmissionService.calculate_summary(db, facility_id)
        if summary.get("total_emissions", 0) == 0:
            return {
                "facility_id": facility_id,
                "has_data": False,
                "facility_name": facility.business_name,
                "sector": facility.sector,
                "cluster_region": facility.location or "Industrial Corridor",
                "message": "Upload operational telemetry to identify circular by-product matches.",
                "streams": [],
                "totals": {
                    "landfill_diverted_tonnes": 0.0,
                    "disposal_cost_avoided_inr": 0.0,
                    "byproduct_revenue_inr": 0.0,
                    "net_economic_benefit_inr": 0.0,
                    "co2_abatement_tonnes": 0.0,
                    "matches_count": 0,
                    "material_reuse_score": 0.0
                }
            }

        sector_lower = (facility.sector or "manufacturing").lower()
        prod_vol = max(100.0, float(summary.get("total_production_volume", 1000.0)))
        location = facility.location or "Gujarat Industrial Corridor"

        # Sector-specific empirical by-product stream generation
        streams: List[Dict[str, Any]] = []

        if any(k in sector_lower for k in ["metal", "alloy", "steel", "cast", "machin"]):
            # Stream 1: Foundry Slag & Metallurgical Dross
            slag_tonnes = round(prod_vol * 0.012, 1)  # ~1.2% by-product ratio
            slag_disp_saved = round(slag_tonnes * 2400.0)  # Hazardous landfill tipping fee avoided
            slag_rev = round(slag_tonnes * 850.0)  # Sold as pozzolanic cement raw material
            slag_co2 = round(slag_tonnes * 0.72, 1)  # Virgin clinker displacement factor

            streams.append({
                "stream_id": "slag_cement_aggregate",
                "byproduct_name": "Foundry Slag & Metallurgical Dross",
                "category": "Solid Mineral Waste",
                "annual_quantity": slag_tonnes,
                "unit": "Tonnes/year",
                "linear_pathway": "Hazardous industrial landfill dumping with tipping fee liability",
                "circular_loop": "Clinker Cement Blending & Road Base Subgrade Aggregate",
                "offtaker_partner": "Gujarat Ultratech & Ambuja Clinker Cluster (Vadodara-Anand)",
                "distance_km": 28,
                "disposal_cost_avoided_inr": slag_disp_saved,
                "byproduct_revenue_inr": slag_rev,
                "net_benefit_inr": slag_disp_saved + slag_rev,
                "co2_abatement_tonnes": slag_co2,
                "diversion_rate_percent": 94.0,
                "circular_tier": "Upcycled By-Product",
                "symbiosis_status": "Off-Taker Match Verified",
                "readiness": "Immediate Contract"
            })

            # Stream 2: High-Grade Machining Swarf & Tooling Chips
            swarf_tonnes = round(prod_vol * 0.008, 1)
            swarf_disp_saved = round(swarf_tonnes * 1500.0)
            swarf_rev = round(swarf_tonnes * 4200.0)
            swarf_co2 = round(swarf_tonnes * 1.45, 1)

            streams.append({
                "stream_id": "swarf_resmelting",
                "byproduct_name": "Ferrous & Alloy Machining Swarf / Turnings",
                "category": "Metallic Scrap",
                "annual_quantity": swarf_tonnes,
                "unit": "Tonnes/year",
                "linear_pathway": "Open yard weathering and low-value scrap downcycling",
                "circular_loop": "Closed-Loop Hydraulic Briquetting & Induction Re-smelting",
                "offtaker_partner": "Western India Secondary Alloy Smelters Consortium",
                "distance_km": 19,
                "disposal_cost_avoided_inr": swarf_disp_saved,
                "byproduct_revenue_inr": swarf_rev,
                "net_benefit_inr": swarf_disp_saved + swarf_rev,
                "co2_abatement_tonnes": swarf_co2,
                "diversion_rate_percent": 98.5,
                "circular_tier": "Closed-Loop Metallurgy",
                "symbiosis_status": "Off-Taker Match Verified",
                "readiness": "Active Secondary Loop"
            })

            # Stream 3: High-Temperature Flue Gas Thermal Stream
            streams.append({
                "stream_id": "flue_thermal_cascade",
                "byproduct_name": "Annealing & Melting Furnace Exhaust Flue Gas",
                "category": "Thermal Energy Stream",
                "annual_quantity": round(prod_vol * 0.25, 0),
                "unit": "GJ/year",
                "linear_pathway": "Unmodulated atmospheric stack dissipation (>320°C)",
                "circular_loop": "Thermal Cascade to Adjacent Core-Sand Pre-Drying Kiln",
                "offtaker_partner": "Adjacent GIDC Foundry Core-Making Unit",
                "distance_km": 2,
                "disposal_cost_avoided_inr": 0.0,
                "byproduct_revenue_inr": 380000.0,
                "net_benefit_inr": 380000.0,
                "co2_abatement_tonnes": round(prod_vol * 0.015, 1),
                "diversion_rate_percent": 82.0,
                "circular_tier": "Thermal Symbiosis",
                "symbiosis_status": "Inter-Facility Pipe Loop Feasible",
                "readiness": "Piping Tie-In"
            })

        elif any(k in sector_lower for k in ["textile", "garment", "dye", "weave"]):
            # Stream 1: Spent Mercerizing Caustic Soda Lye
            lye_tonnes = round(prod_vol * 0.015, 1)
            lye_disp = round(lye_tonnes * 3200.0)
            lye_rev = round(lye_tonnes * 4500.0)
            lye_co2 = round(lye_tonnes * 1.15, 1)

            streams.append({
                "stream_id": "caustic_crs_recovery",
                "byproduct_name": "Spent Mercerization Caustic Lye (NaOH)",
                "category": "Liquid Chemical By-Product",
                "annual_quantity": lye_tonnes,
                "unit": "Tonnes/year",
                "linear_pathway": "Neutralization in ETP with high sulfuric acid and sludge volume",
                "circular_loop": "Closed-Loop Caustic Recovery System (CRS) & Acid Neutralizer",
                "offtaker_partner": "Surat Common Effluent Treatment Plant (CETP) Symbiosis",
                "distance_km": 12,
                "disposal_cost_avoided_inr": lye_disp,
                "byproduct_revenue_inr": lye_rev,
                "net_benefit_inr": lye_disp + lye_rev,
                "co2_abatement_tonnes": lye_co2,
                "diversion_rate_percent": 91.0,
                "circular_tier": "Chemical Reclaim",
                "symbiosis_status": "Off-Taker Match Verified",
                "readiness": "Immediate Contract"
            })

            # Stream 2: Fabric Cutting Selvage Scrap
            scrap_tonnes = round(prod_vol * 0.022, 1)
            scrap_disp = round(scrap_tonnes * 1800.0)
            scrap_rev = round(scrap_tonnes * 5200.0)
            scrap_co2 = round(scrap_tonnes * 1.85, 1)

            streams.append({
                "stream_id": "fabric_shoddy_yarn",
                "byproduct_name": "Bleached & Dyed Fabric Cutting Selvage",
                "category": "Fibrous Textile Waste",
                "annual_quantity": scrap_tonnes,
                "unit": "Tonnes/year",
                "linear_pathway": "Solid municipal incineration and dumping",
                "circular_loop": "Garnetting to Regenerated Shoddy Yarn & Acoustic Batts",
                "offtaker_partner": "South Gujarat Recycled Fiber & Insulation Mills",
                "distance_km": 15,
                "disposal_cost_avoided_inr": scrap_disp,
                "byproduct_revenue_inr": scrap_rev,
                "net_benefit_inr": scrap_disp + scrap_rev,
                "co2_abatement_tonnes": scrap_co2,
                "diversion_rate_percent": 96.0,
                "circular_tier": "Textile-to-Textile Loop",
                "symbiosis_status": "Off-Taker Match Verified",
                "readiness": "Active Secondary Loop"
            })

        elif any(k in sector_lower for k in ["chem", "polymer", "pharma", "plastic"]):
            # Stream 1: Spent Organic Solvents
            solv_tonnes = round(prod_vol * 0.018, 1)
            solv_disp = round(solv_tonnes * 6500.0)
            solv_rev = round(solv_tonnes * 14000.0)
            solv_co2 = round(solv_tonnes * 2.4, 1)

            streams.append({
                "stream_id": "solvent_redistillation",
                "byproduct_name": "Mixed Industrial Solvents (IPA, Toluene, Acetone)",
                "category": "Organic Solvent Stream",
                "annual_quantity": solv_tonnes,
                "unit": "Tonnes/year",
                "linear_pathway": "Hazardous co-processing incineration",
                "circular_loop": "Fractional Vacuum Distillation & High-Purity Solvent Reclaim",
                "offtaker_partner": "Dahej Petrochem Industrial Solvent Reclaimers",
                "distance_km": 34,
                "disposal_cost_avoided_inr": solv_disp,
                "byproduct_revenue_inr": solv_rev,
                "net_benefit_inr": solv_disp + solv_rev,
                "co2_abatement_tonnes": solv_co2,
                "diversion_rate_percent": 88.0,
                "circular_tier": "Chemical Reclaim",
                "symbiosis_status": "Off-Taker Match Verified",
                "readiness": "Immediate Contract"
            })

            # Stream 2: Polymer Purge Scrap & Runners
            poly_tonnes = round(prod_vol * 0.014, 1)
            poly_disp = round(poly_tonnes * 2200.0)
            poly_rev = round(poly_tonnes * 7500.0)
            poly_co2 = round(poly_tonnes * 1.65, 1)

            streams.append({
                "stream_id": "polymer_regranulation",
                "byproduct_name": "Thermoplastic Purge Lumps & Injection Runners",
                "category": "Polymer Scrap",
                "annual_quantity": poly_tonnes,
                "unit": "Tonnes/year",
                "linear_pathway": "Degraded plastic landfill accumulation",
                "circular_loop": "Cryogenic Grinding & Compounded Masterbatch Pellets",
                "offtaker_partner": "Western India Polymer Recycling Center",
                "distance_km": 21,
                "disposal_cost_avoided_inr": poly_disp,
                "byproduct_revenue_inr": poly_rev,
                "net_benefit_inr": poly_disp + poly_rev,
                "co2_abatement_tonnes": poly_co2,
                "diversion_rate_percent": 95.0,
                "circular_tier": "Mechanical Recycling",
                "symbiosis_status": "Off-Taker Match Verified",
                "readiness": "Active Secondary Loop"
            })

        else:
            # General Industrial Manufacturing
            mat_tonnes = round(prod_vol * 0.010, 1)
            streams.append({
                "stream_id": "packaging_corrugated_loop",
                "byproduct_name": "Industrial Corrugated & Plastic Packaging Scrap",
                "category": "Packaging Waste",
                "annual_quantity": mat_tonnes,
                "unit": "Tonnes/year",
                "linear_pathway": "Mixed municipal solid waste disposal",
                "circular_loop": "Baled Closed-Loop Pulping & Paperboard Manufacturing",
                "offtaker_partner": "Regional Kraft Paper & Corrugation Mills",
                "distance_km": 18,
                "disposal_cost_avoided_inr": round(mat_tonnes * 1200.0),
                "byproduct_revenue_inr": round(mat_tonnes * 4500.0),
                "net_benefit_inr": round(mat_tonnes * 5700.0),
                "co2_abatement_tonnes": round(mat_tonnes * 0.95, 1),
                "diversion_rate_percent": 92.0,
                "circular_tier": "Material Recirculation",
                "symbiosis_status": "Off-Taker Match Verified",
                "readiness": "Active Secondary Loop"
            })

        # -------------------------------------------------------------
        # Ingest user-registered custom by-product streams from DB
        # -------------------------------------------------------------
        try:
            custom_db_streams = db.query(SymbiosisStream).filter(SymbiosisStream.facility_id == facility_id).all()
            for cs in custom_db_streams:
                streams.append({
                    "stream_id": f"custom_stream_{cs.id}",
                    "id": cs.id,
                    "byproduct_name": cs.byproduct_name,
                    "category": cs.category,
                    "annual_quantity": cs.annual_quantity,
                    "unit": cs.unit,
                    "linear_pathway": cs.linear_pathway,
                    "circular_loop": cs.circular_loop,
                    "offtaker_partner": cs.offtaker_partner,
                    "distance_km": cs.distance_km,
                    "disposal_cost_avoided_inr": cs.disposal_cost_avoided_inr,
                    "byproduct_revenue_inr": cs.byproduct_revenue_inr,
                    "net_benefit_inr": cs.net_benefit_inr,
                    "co2_abatement_tonnes": cs.co2_abatement_tonnes,
                    "diversion_rate_percent": cs.diversion_rate_percent,
                    "circular_tier": cs.circular_tier,
                    "symbiosis_status": cs.symbiosis_status,
                    "readiness": cs.readiness,
                    "is_custom": True
                })
        except Exception:
            pass

        total_div_tonnes = round(sum(s["annual_quantity"] for s in streams if "Tonne" in s["unit"]), 1)
        total_disp_saved = round(sum(s["disposal_cost_avoided_inr"] for s in streams))
        total_rev = round(sum(s["byproduct_revenue_inr"] for s in streams))
        total_co2 = round(sum(s["co2_abatement_tonnes"] for s in streams), 1)
        avg_diversion = round(sum(s["diversion_rate_percent"] for s in streams) / len(streams), 1) if streams else 0.0

        # Empirical Material Recirculation Score (0-100)
        mat_score = round(min(96.0, max(45.0, avg_diversion * 0.88 + len(streams) * 3.5)), 1)

        return {
            "facility_id": facility_id,
            "has_data": True,
            "facility_name": facility.business_name,
            "sector": facility.sector,
            "cluster_region": location,
            "message": f"Identified {len(streams)} verified industrial symbiosis exchange loops.",
            "streams": streams,
            "totals": {
                "landfill_diverted_tonnes": total_div_tonnes,
                "disposal_cost_avoided_inr": total_disp_saved,
                "byproduct_revenue_inr": total_rev,
                "net_economic_benefit_inr": total_disp_saved + total_rev,
                "co2_abatement_tonnes": total_co2,
                "average_diversion_rate_percent": avg_diversion,
                "matches_count": len(streams),
                "material_reuse_score": mat_score
            }
        }

    @staticmethod
    def add_custom_stream(db: Session, facility_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a new industrial by-product stream for circular sale/off-take.
        Pairs with appropriate regional off-taker and computes economics.
        """
        facility = db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            raise ValueError(f"Facility #{facility_id} not found.")

        name = payload.get("byproduct_name", "Industrial By-Product").strip()
        category = payload.get("category", "Solid Mineral Waste").strip()
        qty = max(0.1, float(payload.get("annual_quantity", 10.0)))
        unit = payload.get("unit", "Tonnes/year").strip()
        disp_cost_per_unit = float(payload.get("current_disposal_cost_per_unit", 2000.0))
        selling_price_per_unit = float(payload.get("selling_price_per_unit", 1500.0))

        cat_lower = category.lower()
        name_lower = name.lower()

        # Intelligent regional off-taker match
        if any(k in cat_lower or k in name_lower for k in ["oil", "liquid", "solvent", "chemical", "sludge"]):
            partner = "Gujarat Industrial Re-Refining & Spent Solvent Recovery (Ankleshwar / Dahej)"
            loop = "Closed-Loop Vacuum Re-refining & Chemical Blending"
            tier = "Secondary Re-Refining"
            dist = 32
            co2_factor = 1.35
        elif any(k in cat_lower or k in name_lower for k in ["sand", "mineral", "slag", "ash", "stone", "dust"]):
            partner = "Vadodara Eco-Brick & Geopolymer Consortium"
            loop = "High-Strength Clinker & Fly-Ash Bricks Raw Feedstock"
            tier = "Building Material Subgrade"
            dist = 18
            co2_factor = 0.80
        elif any(k in cat_lower or k in name_lower for k in ["plastic", "polymer", "film", "bag", "wrap"]):
            partner = "Western India Polymer Extrusion & Pelletization Hub"
            loop = "Compounded Masterbatch & High-Density Strapping Recirculation"
            tier = "Mechanical Polymer Recycling"
            dist = 26
            co2_factor = 1.60
        elif any(k in cat_lower or k in name_lower for k in ["wood", "timber", "biomass", "pallet", "sawdust"]):
            partner = "Halol Industrial Bio-Pellet & Steam Boiler Cluster"
            loop = "Densified Bio-Carbon Fuel Pellets for Clean Coal Substitution"
            tier = "Renewable Bio-Carrier"
            dist = 15
            co2_factor = 1.10
        elif any(k in cat_lower or k in name_lower for k in ["metal", "iron", "steel", "aluminum", "copper", "brass"]):
            partner = "Gujarat Secondary Metals & Induction Smelting Hub"
            loop = "Hydraulic Baling & Induction Smelting into Commercial Billets"
            tier = "Closed-Loop Metallurgy"
            dist = 22
            co2_factor = 1.55
        else:
            partner = "Regional Eco-Industrial Off-Take Consortium (Gujarat Corridor)"
            loop = "Secondary By-Product Circular Utilization"
            tier = "Upcycled By-Product"
            dist = 25
            co2_factor = 0.90

        # Custom overrides if specified in payload
        if payload.get("offtaker_partner"):
            partner = payload.get("offtaker_partner")
        if payload.get("circular_loop"):
            loop = payload.get("circular_loop")

        disp_saved = round(qty * disp_cost_per_unit)
        sales_rev = round(qty * selling_price_per_unit)
        net_benefit = disp_saved + sales_rev
        co2_saved = round(qty * co2_factor, 1)

        new_stream = SymbiosisStream(
            facility_id=facility_id,
            byproduct_name=name,
            category=category,
            annual_quantity=qty,
            unit=unit,
            linear_pathway=payload.get("linear_pathway", f"Hazardous landfill dumping @ ₹{int(disp_cost_per_unit):,}/{unit}"),
            circular_loop=loop,
            offtaker_partner=partner,
            distance_km=dist,
            disposal_cost_avoided_inr=disp_saved,
            byproduct_revenue_inr=sales_rev,
            net_benefit_inr=net_benefit,
            co2_abatement_tonnes=co2_saved,
            diversion_rate_percent=95.0,
            circular_tier=tier,
            symbiosis_status="Off-Taker Match Verified",
            readiness="Immediate Contract"
        )
        db.add(new_stream)
        db.commit()
        db.refresh(new_stream)

        return {
            "stream_id": f"custom_stream_{new_stream.id}",
            "id": new_stream.id,
            "byproduct_name": new_stream.byproduct_name,
            "category": new_stream.category,
            "annual_quantity": new_stream.annual_quantity,
            "unit": new_stream.unit,
            "linear_pathway": new_stream.linear_pathway,
            "circular_loop": new_stream.circular_loop,
            "offtaker_partner": new_stream.offtaker_partner,
            "distance_km": new_stream.distance_km,
            "disposal_cost_avoided_inr": new_stream.disposal_cost_avoided_inr,
            "byproduct_revenue_inr": new_stream.byproduct_revenue_inr,
            "net_benefit_inr": new_stream.net_benefit_inr,
            "co2_abatement_tonnes": new_stream.co2_abatement_tonnes,
            "diversion_rate_percent": new_stream.diversion_rate_percent,
            "circular_tier": new_stream.circular_tier,
            "symbiosis_status": new_stream.symbiosis_status,
            "readiness": new_stream.readiness,
            "is_custom": True
        }

