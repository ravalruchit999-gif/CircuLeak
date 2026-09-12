from typing import Dict, Any
from sqlalchemy.orm import Session
try:
    from app.services.emission_service import EmissionService
    from app.data.benchmark_data import get_sector_benchmark
    from app.ml.peer_clustering import PeerClusterEngine
except (ImportError, ModuleNotFoundError):
    from .emission_service import EmissionService
    from ..data.benchmark_data import get_sector_benchmark
    from ..ml.peer_clustering import PeerClusterEngine


class BenchmarkService:
    @staticmethod
    def get_benchmark(db: Session, facility_id: int) -> Dict[str, Any]:
        """
        Evaluate facility emission intensity against industry standards and India's CCTS thresholds.
        If intensity is 0, indicates no data uploaded yet.
        """
        summary = EmissionService.calculate_summary(db, facility_id)
        intensity = summary["emissions_intensity"]
        sector = summary["sector"]

        benchmark = get_sector_benchmark(sector)
        avg_intensity = benchmark["average_intensity"]
        ccts_threshold = benchmark["ccts_threshold"]

        if intensity == 0:
            return {
                "facility_id": facility_id,
                "has_data": False,
                "sector": benchmark["sector_name"],
                "facility_intensity": 0.0,
                "benchmark_average": avg_intensity,
                "difference_percent": 0.0,
                "performance": "Insufficient Data",
                "ccts_threshold": ccts_threshold,
                "ccts_compliance_status": "Awaiting Telemetry Ingestion",
                "best_in_class": benchmark["best_in_class"],
                "unit": benchmark["unit"],
                "source": benchmark["source"],
                "synthetic": False
            }

        diff_percent = round(((intensity - avg_intensity) / avg_intensity) * 100, 1) if avg_intensity > 0 else 0.0

        if intensity <= benchmark["best_in_class"]:
            performance = "Best in Class (Top 10%)"
        elif intensity < avg_intensity:
            performance = "Outperforming Sector Average"
        elif intensity <= avg_intensity * 1.15:
            performance = "On Par with Sector Average"
        else:
            performance = "High Intensity (Carbon Leak Risk)"

        ccts_compliant = intensity <= ccts_threshold
        ccts_status = "Compliant" if ccts_compliant else "Action Required (Exceeds CCTS Regulatory Threshold)"

        return {
            "facility_id": facility_id,
            "has_data": True,
            "sector": benchmark["sector_name"],
            "facility_intensity": intensity,
            "benchmark_average": avg_intensity,
            "difference_percent": diff_percent,
            "performance": performance,
            "ccts_threshold": ccts_threshold,
            "ccts_compliance_status": ccts_status,
            "best_in_class": benchmark["best_in_class"],
            "unit": benchmark["unit"],
            "source": benchmark["source"],
            "synthetic": benchmark.get("synthetic", False)
        }

    @staticmethod
    def get_peer_clustering(db: Session, facility_id: int) -> Dict[str, Any]:
        """Run statistically defensible K-Means peer clustering against real sector peers."""
        summary = EmissionService.calculate_summary(db, facility_id)
        intensity = summary["emissions_intensity"]
        volume = summary["total_production_volume"]
        sector = summary["sector"]

        benchmark = get_sector_benchmark(sector)
        avg_intensity = benchmark["average_intensity"]

        if intensity == 0:
            return {
                "facility_id": facility_id,
                "has_peer_data": False,
                "status": "insufficient_data",
                "cluster_label": "Unassigned",
                "cluster_name": "No Telemetry Records",
                "message": "Telemetry must be ingested before benchmarking against peer facilities.",
                "peer_count": 0,
                "peer_cohort_size": 0,
                "cohort_average_intensity": avg_intensity,
                "gap_to_cohort_avg_percent": 0.0,
                "peers": []
            }

        # Query genuine peer facilities in the same sector
        from app.models.facility import Facility
        from app.models.process_data import ProcessData
        from sqlalchemy import func

        other_facilities = db.query(Facility).filter(
            Facility.sector == sector,
            Facility.id != facility_id
        ).all()

        peer_pool = []
        for fac in other_facilities:
            obs_count = db.query(func.count(ProcessData.id)).filter(ProcessData.facility_id == fac.id).scalar() or 0
            if obs_count > 0:
                fac_summary = EmissionService.calculate_summary(db, fac.id)
                peer_pool.append({
                    "facility_id": fac.id,
                    "business_name": fac.business_name,
                    "observation_count": obs_count,
                    "production_volume": fac_summary["total_production_volume"],
                    "electricity_intensity": round(fac_summary["total_electricity_kwh"] / max(1.0, fac_summary["total_production_volume"]), 3),
                    "intensity": fac_summary["emissions_intensity"]
                })

        target_fac_info = {
            "facility_id": facility_id,
            "production_volume": volume,
            "electricity_intensity": round(summary["total_electricity_kwh"] / max(1.0, volume), 3),
            "intensity": intensity
        }

        cluster_engine = PeerClusterEngine()
        res = cluster_engine.cluster_facility(
            target_facility=target_fac_info,
            peer_pool=peer_pool,
            sector_baseline=avg_intensity
        )

        return {
            "facility_id": facility_id,
            "has_peer_data": res["has_peer_data"],
            "status": res.get("status", "insufficient_data"),
            "cluster_label": str(res.get("cluster_label", "Unassigned")),
            "cluster_name": res.get("cluster_name", "Insufficient Benchmark Peers"),
            "message": res.get("message", ""),
            "peer_count": res.get("peer_count", len(peer_pool)),
            "peer_cohort_size": res.get("similar_facility_count", len(peer_pool)),
            "cohort_average_intensity": res.get("cluster_average", avg_intensity),
            "gap_to_cohort_avg_percent": res.get("gap_percent", 0.0),
            "criteria_status": res.get("criteria_status", {}),
            "peer_characteristics": res.get("peer_characteristics", {}),
            "peers": [
                {
                    "facility_id": p["facility_id"],
                    "name": p["business_name"],
                    "intensity": p["intensity"],
                    "volume": p["production_volume"]
                }
                for p in peer_pool
            ]
        }

