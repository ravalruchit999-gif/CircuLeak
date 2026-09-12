# CircuLeak Backend API

> **Industrial Emission Leak-Point Detector & Circular Alternative Recommender**  
> Built for **HackOut'26** (Daiict) | Theme: **Circular Carbon Ecosystem** | Team: **Techeys**

CircuLeak is a software-first, AI/ML-powered industrial carbon intelligence and decision-support platform. It transforms raw, structured industrial process and utility data into an actionable, costed decarbonization plan.

---

## 1. Project Architecture & Pipeline

```text
Raw Utility & Process Data (CSV / API)
        ↓
Standardized Emission Calculation (CEA Grid + IPCC Factors)
        ↓
Two-Layer Leak Detection:
  ├─ Layer 1: Structural Hotspots (Pareto 80/20 Contribution)
  └─ Layer 2: Behavioral Anomalies (Isolation Forest + Residual Baselines)
        ↓
Curated Circular Interventions (Semantic & Rule Matching)
        ↓
Intervention Priority Engine (Multi-Criteria Scoring)
        ↓
Decision Engine:
  ├─ Live What-If Simulation
  ├─ Automated Scenario Comparison (Cost Saver / Balanced / Max Decarb)
  └─ 5-Year Decarbonization & Financial Trajectory
        ↓
Benchmarking & Compliance (India CCTS Regulatory Thresholds & K-Means Peer Cohorts)
        ↓
Circularity Scorecard (5 Dimensions, 0–100 Rating)
        ↓
AI Audit Intelligence (Executive Audit Summary over Verified Structured JSON)
        ↓
Downloadable Executive PDF Audit Report (12 Sections via ReportLab)
```

> [!IMPORTANT]
> **Key Explainability Rule:**  
> The LLM **never calculates emissions, ROI, or benchmarks**. All numbers are calculated by deterministic Python services and ML models. The LLM acts solely as an **AI Audit Intelligence (Executive Audit Summary)** narrative synthesizer over verified structured JSON. If an LLM API key is not provided, the backend falls back cleanly to a deterministic narrative generator with zero disruption.

---

## 2. Directory Structure

```text
backend/
│
├── app/
│   ├── main.py                     # FastAPI application entrypoint & CORS config
│   │
│   ├── core/
│   │   ├── config.py               # Pydantic Settings & environment variables
│   │   ├── database.py             # SQLAlchemy Engine, SessionLocal, get_db
│   │   └── security.py             # Input sanitization and validation utilities
│   │
│   ├── models/
│   │   ├── facility.py             # Facility profile model
│   │   ├── process_data.py         # Time-series/batch telemetry data model
│   │   ├── emission_factor.py      # Citable emission factors library
│   │   ├── leak.py                 # Structural & behavioral leak records
│   │   ├── recommendation.py       # Circular intervention knowledge base
│   │   ├── simulation.py           # What-if and scenario simulations
│   │   └── benchmark.py            # Industry & regulatory standards
│   │
│   ├── schemas/
│   │   ├── common.py               # Standard APIResponse[T] wrapper
│   │   ├── facility.py             # Facility request/response schemas
│   │   ├── upload.py               # CSV upload summary schemas
│   │   ├── emissions.py            # Summary, breakdown, timeline, and Sankey schemas
│   │   ├── leak.py                 # Hotspots, anomalies, and explainable leak schemas
│   │   ├── recommendation.py       # Recommendation and priority schemas
│   │   ├── simulation.py           # What-if and scenario schemas
│   │   ├── trajectory.py           # 5-year trajectory schemas
│   │   ├── benchmark.py            # Benchmark scorecard and peer cluster schemas
│   │   ├── circularity.py          # Circularity score (5 dimensions) schemas
│   │   ├── audit.py                # Executive Audit Summary schemas
│   │   └── report.py               # PDF generation & download schemas
│   │
│   ├── api/
│   │   ├── router.py               # Master API router
│   │   └── routes/
│   │       ├── facility.py         # POST /api/facility, GET /api/facility/{id}
│   │       ├── upload.py           # POST /api/upload/csv
│   │       ├── emissions.py        # GET /api/emissions/summary, breakdown, timeline, sankey
│   │       ├── leaks.py            # GET /api/leaks/hotspots, anomalies, {id}
│   │       ├── recommendations.py  # GET /api/recommendations, /api/interventions/priority
│   │       ├── simulation.py       # POST /api/simulation/what-if, scenarios
│   │       ├── trajectory.py       # GET /api/trajectory/{facility_id}
│   │       ├── benchmark.py        # GET /api/benchmark/{facility_id}, peer-cluster
│   │       ├── circularity.py      # GET /api/circularity/{facility_id}
│   │       ├── audit.py            # POST /api/audit/summary (Executive Audit Summary)
│   │       └── report.py           # POST /api/report/generate, GET /api/report/download/{file}
│   │
│   ├── services/
│   │   ├── facility_service.py     # Facility business logic
│   │   ├── csv_service.py          # CSV ingestion, validation, row-by-row emission math
│   │   ├── emission_service.py     # Aggregation & Sankey flow graph builder
│   │   ├── leak_service.py         # Pareto 80/20 hotspots & explainable anomaly diagnosis
│   │   ├── recommendation_service.py # Semantic and heuristic intervention matching
│   │   ├── priority_service.py     # Multi-criteria weighted ranking engine
│   │   ├── simulation_service.py   # Live What-If ROI and 3 automated scenarios
│   │   ├── trajectory_service.py   # 5-year phased trajectory projection
│   │   ├── benchmark_service.py    # CCTS compliance scorecard & peer clustering
│   │   ├── circularity_service.py  # 5-dimension 0–100 Circularity Score engine
│   │   ├── audit_service.py        # AI Audit Intelligence / Executive Narrative
│   │   └── report_service.py       # 12-section PDF audit report generation
│   │
│   ├── ml/
│   │   ├── anomaly_detector.py     # Isolation Forest + rolling baseline residual checks
│   │   ├── peer_clustering.py      # K-Means clustering for peer facility benchmarking
│   │   └── feature_engineering.py  # Specific energy consumption & off-hours feature flags
│   │
│   ├── data/
│   │   ├── emission_factors.py     # Centralized CEA & IPCC emission factor dictionary
│   │   ├── recommendations.py      # 25+ real industrial circular interventions
│   │   ├── benchmark_data.py       # Textile, Chemical, Metal, Food benchmarks with CCTS caps
│   │   └── demo_industrial_data.csv # 672-row realistic hourly telemetry with embedded anomalies
│   │
│   └── utils/
│       ├── calculations.py         # Deterministic calculations & safe division
│       ├── validators.py           # CSV column and row integrity checks
│       └── units.py                # Formatting for INR currency and emissions
│
├── alembic/                        # Database migration configuration and scripts
├── tests/
│   ├── conftest.py                 # SQLite in-memory test fixtures and FastAPI client
│   ├── test_emissions.py           # Emission calculation tests
│   ├── test_leaks.py               # Hotspots and Isolation Forest anomaly tests
│   ├── test_recommendations.py     # Recommendation matching and priority tests
│   ├── test_simulation.py          # What-if ROI and scenario tests
│   └── test_api.py                 # Complete 12-stage end-to-end integration test
│
├── uploads/                        # Generated PDF reports and uploaded artifacts
├── .env.example                    # Sample environment configuration
├── .gitignore                      # Git ignore patterns
├── requirements.txt                # Python dependencies
├── alembic.ini                     # Alembic configuration file
└── README.md                       # Complete API contract and integration guide
```

---

## 3. Technology Stack

* **Language**: Python 3.11+
* **Framework**: FastAPI
* **Validation**: Pydantic v2 & Pydantic-Settings
* **ORM & Migrations**: SQLAlchemy v2 & Alembic
* **Database**: PostgreSQL (with automatic SQLite fallback for local offline testing)
* **Data Science & ML**: Pandas, NumPy, scikit-learn (Isolation Forest, K-Means)
* **Reporting**: ReportLab (vector PDF generation)
* **Server**: Uvicorn

---

## 4. Setup & Installation

### Step 1: Clone and Navigate to Backend
```powershell
cd d:\CircuLeak\CircuLeak\backend
```

### Step 2: Install Dependencies
```powershell
py -3.11 -m pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```

Edit `.env` as needed:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/circuleak
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional: LLM API Key for Executive Narrative (falls back to deterministic engine if empty)
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=https://api.openai.com/v1

UPLOAD_DIR=uploads
```

### Step 4: Run Database Migrations (Optional for PostgreSQL)
```powershell
py -3.11 -m alembic upgrade head
```
*(Note: If running against SQLite or without PostgreSQL active, SQLAlchemy automatically initializes all tables on startup).*

### Step 5: Start the Backend Server
```powershell
py -3.11 -m uvicorn app.main:app --reload --port 8000
```
The API is now running at:
* **Base URL**: `http://127.0.0.1:8000`
* **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
* **ReDoc**: `http://127.0.0.1:8000/redoc`

---

## 5. Running Automated Tests

Run the full test suite with pytest:
```powershell
py -3.11 -m pytest tests/ -v
```

---

## 6. Complete API Contract for Frontend Developers

The backend provides consistent JSON response envelopes:
```json
// Success Response:
{
  "success": true,
  "data": { ... }
}

// Error Response:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Detailed error explanation"
  }
}
```

### Endpoint Map

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | System health check |
| `POST` | `/api/facility` | Create an industrial facility profile |
| `GET` | `/api/facility/{id}` | Retrieve facility profile details |
| `GET` | `/api/facility` | List registered facilities |
| `POST` | `/api/upload/csv` | Ingest time-series telemetry CSV (multipart/form-data) |
| `GET` | `/api/emissions/summary/{id}` | Total footprint, intensity, and high-level breakdown |
| `GET` | `/api/emissions/breakdown/{id}` | Categorical breakdowns by source, process, equipment |
| `GET` | `/api/emissions/timeline/{id}` | Daily/monthly time-series emissions |
| `GET` | `/api/emissions/sankey/{id}` | Nodes & links for interactive Sankey diagram |
| `GET` | `/api/leaks/hotspots/{id}` | Pareto (80/20) structural emission hotspots |
| `GET` | `/api/leaks/anomalies/{id}` | Behavioral leaks & off-hours consumption anomalies |
| `GET` | `/api/leaks/{leak_id}` | Detailed explainable leak record with matched actions |
| `GET` | `/api/recommendations/{id}` | Curated circular alternatives for facility |
| `GET` | `/api/recommendations/leak/{leak_id}` | Tailored circular alternatives for a specific leak |
| `GET` | `/api/interventions/priority/{id}` | Multi-criteria ranked interventions with priority score |
| `POST` | `/api/simulation/what-if` | Deterministic What-If ROI simulation |
| `POST` | `/api/simulation/scenarios` | Automated comparison: Cost Saver, Balanced, Max Decarb |
| `GET` | `/api/trajectory/{id}` | 5-year decarbonization & financial trajectory |
| `GET` | `/api/benchmark/{id}` | Sector benchmarking & India CCTS compliance scorecard |
| `GET` | `/api/benchmark/peer-cluster/{id}` | K-Means peer clustering analysis |
| `GET` | `/api/circularity/{id}` | 5-dimension 0–100 Circularity Score |
| `POST` | `/api/audit/summary` | **AI Audit Intelligence (Executive Audit Summary)** |
| `POST` | `/api/report/generate` | Generate downloadable 12-section PDF Audit Report |
| `GET` | `/api/report/download/{filename}` | Download generated PDF report |

---

## 7. Example Workflow & API Requests

### 1. Create a Facility
`POST /api/facility`
```json
{
  "business_name": "ABC Manufacturing Ltd.",
  "sector": "Textile",
  "location": "Ahmedabad, Gujarat",
  "production_type": "Fabric Manufacturing",
  "production_volume": 12000.0,
  "employees": 85,
  "operating_hours": 16.0,
  "energy_sources": ["grid_electricity", "natural_gas", "diesel"]
}
```

### 2. Upload Industrial CSV
`POST /api/upload/csv`  
Form Data:
* `facility_id`: `1`
* `file`: Attach `app/data/demo_industrial_data.csv`

Expected CSV columns:
```csv
date,hour,equipment,process,electricity_kwh,fuel_type,fuel_quantity,production_volume,operating_hours
2026-08-01,10,Compressor 03 (Screw),Compressed Air,34.2,none,0.0,85.0,1.0
```

### 3. Run What-If Simulation
`POST /api/simulation/what-if`
```json
{
  "facility_id": 1,
  "intervention_ids": [
    "whr_boiler_flue",
    "air_leak_audit_repair",
    "vfd_compressor_retrofit"
  ]
}
```
Response:
```json
{
  "success": true,
  "data": {
    "facility_id": 1,
    "baseline_emissions": 18450.2,
    "projected_emissions": 13820.0,
    "total_reduction": 4630.2,
    "reduction_percent": 25.1,
    "investment": 615000.0,
    "annual_savings": 435000.0,
    "payback_years": 1.41,
    "five_year_savings": 1560000.0,
    "selected_interventions": [...]
  }
}
```

### 4. Executive Audit Summary (AI Audit Intelligence)
`POST /api/audit/summary`
```json
{
  "facility_id": 1
}
```
Response:
```json
{
  "success": true,
  "data": {
    "facility_id": 1,
    "report_title": "Executive Audit Summary",
    "generated_by": "CircuLeak AI Audit Intelligence Pipeline",
    "is_llm_narrative": false,
    "executive_narrative": "EXECUTIVE AUDIT SUMMARY FOR ABC MANUFACTURING LTD.:\n\nAn industrial carbon audit was conducted using the CircuLeak intelligence pipeline across utility and process telemetry...",
    "overall_carbon_status": "High Intensity (Carbon Leak Risk)",
    "structured_audit_data": {
      "total_emissions_kg": 18450.2,
      "emission_intensity": 1.54,
      "ccts_status": "Action Required (Exceeds CCTS Regulatory Threshold)",
      "top_hotspots": [...],
      "anomalies": [...],
      "recommendations": [...]
    },
    "key_findings": [...]
  }
}
```

### 5. Generate PDF Audit Report
`POST /api/report/generate`
```json
{
  "facility_id": 1
}
```
Response:
```json
{
  "success": true,
  "data": {
    "facility_id": 1,
    "report_title": "CircuLeak Industrial Carbon Audit",
    "file_name": "CircuLeak_Audit_Facility_1_20260912_024500.pdf",
    "download_url": "/api/report/download/CircuLeak_Audit_Facility_1_20260912_024500.pdf",
    "file_size_bytes": 18420,
    "sections_included": [
      "1. Executive Summary",
      "2. Facility Profile",
      "3. Emission Overview",
      "4. Top Carbon Leaks",
      "5. Behavioral Anomalies",
      "6. Circular Recommendations",
      "7. Intervention Priority",
      "8. ROI Analysis",
      "9. Benchmarking",
      "10. Circularity Score",
      "11. Five-Year Projection",
      "12. Action Roadmap"
    ]
  }
}
```

---

## 8. CCTS & Carbon Factor Citations

1. **Electricity**: 0.716 kgCO2e/kWh — *Central Electricity Authority (CEA) CO2 Baseline Database for the Indian Power Sector, Version 19 (2024)*.
2. **Coal**: 2.42 kgCO2e/kg — *IPCC 2006 Guidelines for National Greenhouse Gas Inventories & BEE India Industrial Reference*.
3. **Diesel**: 2.68 kgCO2e/L — *IPCC 2006 Stationary Combustion*.
4. **Natural Gas**: 1.93 kgCO2e/m³ — *IPCC 2006 / GAIL India Reference Values*.
5. **Biomass**: 0.035 kgCO2e/kg — *BEE & MNRE India Agro-Residue Briquette Non-Biogenic Residual Lifecycle Footprint*.
6. **Regulatory Compliance**: Thresholds pegged against *Bureau of Energy Efficiency (BEE) PAT Cycle VI and India Carbon Credit Trading Scheme (CCTS)*.
