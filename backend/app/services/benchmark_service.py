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
        """
        summary = EmissionService.calculate_summary(db, facility_id)
        intensity = summary["emissions_intensity"]
        sector = summary["sector"]

        benchmark = get_sector_benchmark(sector)
        avg_intensity = benchmark["average_intensity"]
        ccts_threshold = benchmark["ccts_threshold"]

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
        """Run K-Means peer clustering to benchmark against peer facilities."""
        summary = EmissionService.calculate_summary(db, facility_id)
        intensity = summary["emissions_intensity"]
        volume = summary["total_production_volume"]
        sector = summary["sector"]

        benchmark = get_sector_benchmark(sector)
        avg_intensity = benchmark["average_intensity"]

        cluster_engine = PeerClusterEngine(n_clusters=3)
        res = cluster_engine.cluster_facility(
            facility_volume=volume,
            facility_intensity=intensity,
            sector_avg_intensity=avg_intensity
        )
        res["facility_id"] = facility_id
        return res
