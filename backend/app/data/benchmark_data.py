"""
CircuLeak Industry Benchmarking & Regulatory Compliance Standards.
Includes India Carbon Credit Trading Scheme (CCTS) emission intensity thresholds
and sector percentiles based on Bureau of Energy Efficiency (BEE) PAT scheme reports.
"""

from typing import Dict, Any, Optional

SECTOR_BENCHMARKS: Dict[str, Dict[str, Any]] = {
    "textile": {
        "sector_name": "Textile",
        "unit": "kgCO2e/metre",
        "average_intensity": 1.45,
        "median_intensity": 1.38,
        "best_in_class": 0.85,
        "ccts_threshold": 1.25,  # India CCTS compliance target cap
        "description": "Composite textile mill (spinning, weaving, dyeing, finishing)",
        "synthetic": False,
        "source": "BEE PAT Cycle VI Sectoral Target Data & TERI Textile Audit Repository"
    },
    "chemical": {
        "sector_name": "Chemical",
        "unit": "kgCO2e/kg product",
        "average_intensity": 2.80,
        "median_intensity": 2.65,
        "best_in_class": 1.40,
        "ccts_threshold": 2.30,
        "description": "Specialty & intermediate chemical formulation plants",
        "synthetic": False,
        "source": "Indian Chemical Council (ICC) Decarbonization Roadmap"
    },
    "metal_fabrication": {
        "sector_name": "Metal Fabrication",
        "unit": "kgCO2e/tonne",
        "average_intensity": 450.0,
        "median_intensity": 420.0,
        "best_in_class": 280.0,
        "ccts_threshold": 380.0,
        "description": "Machining, stamping, casting and welding operations",
        "synthetic": False,
        "source": "BEE Industrial Energy Consumption Guidelines"
    },
    "food_processing": {
        "sector_name": "Food Processing",
        "unit": "kgCO2e/tonne",
        "average_intensity": 210.0,
        "median_intensity": 195.0,
        "best_in_class": 130.0,
        "ccts_threshold": 175.0,
        "description": "Grain processing, dairy, beverages, and cold chain preservation",
        "synthetic": False,
        "source": "Ministry of Food Processing Industries (MoFPI) Clean Tech Report"
    },
    "plastics": {
        "sector_name": "Plastics & Polymers",
        "unit": "kgCO2e/kg",
        "average_intensity": 1.95,
        "median_intensity": 1.85,
        "best_in_class": 1.10,
        "ccts_threshold": 1.60,
        "description": "Injection moulding, blow moulding, extrusion plants",
        "synthetic": False,
        "source": "Plastindia Energy Efficiency Best Practice Guide"
    },
    "ceramics": {
        "sector_name": "Ceramics & Tiles",
        "unit": "kgCO2e/sq.m",
        "average_intensity": 6.80,
        "median_intensity": 6.40,
        "best_in_class": 4.20,
        "ccts_threshold": 5.50,
        "description": "Gas-fired ceramic tile and sanitaryware kilns",
        "synthetic": False,
        "source": "Morbi Ceramic Cluster BEE Decarbonization Study"
    }
}


def get_sector_benchmark(sector: str) -> Dict[str, Any]:
    """Retrieve benchmark data for a sector with case-insensitive and substring matching."""
    norm = sector.strip().lower().replace(" ", "_").replace("&", "").replace("-", "_")
    
    for key, data in SECTOR_BENCHMARKS.items():
        if key in norm or norm in key:
            return data
            
    # Default fallback benchmark (Generic Manufacturing)
    return {
        "sector_name": sector.title(),
        "unit": "kgCO2e/unit",
        "average_intensity": 1.50,
        "median_intensity": 1.40,
        "best_in_class": 0.90,
        "ccts_threshold": 1.30,
        "description": "General SME Manufacturing benchmark baseline (demo proxy)",
        "synthetic": True,
        "source": "CircuLeak Standard Manufacturing Baseline (Demo)"
    }
