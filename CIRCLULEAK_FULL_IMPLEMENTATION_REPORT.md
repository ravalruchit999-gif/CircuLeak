# CircuLeak — Complete Project Implementation Report
**From Inception to Production-Grade Industrial Carbon Intelligence Platform**

---

## 1. Executive Summary

**CircuLeak** is an enterprise-grade industrial carbon accounting, emission anomaly detection, and circular engineering platform designed for manufacturing plants, heavy industries, foundries, and chemical processing facilities.

The project underwent an evolutionary transformation:
1. **Initial State (Phase 0)**: A frontend UI prototype relying on hardcoded constants, mock JSON files, and static facility metrics.
2. **Current State (Production-Grade SaaS)**: A dynamic, multi-tenant industrial SaaS platform running on **FastAPI (Python)**, **PostgreSQL 17**, and **React 18 (Vite)** with:
   - Zero hardcoded fallback numbers or fake mock data.
   - Real-time data pipeline: **User Registration $\rightarrow$ Facility Provisioning $\rightarrow$ Multi-format Telemetry Ingestion (CSV/XLSX) $\rightarrow$ Automated Scope 1 & 2 GHG Accounting $\rightarrow$ ML-driven Carbon Leak Diagnostics $\rightarrow$ Circular Recommendation Engine $\rightarrow$ Dynamic Executive Dashboard & Audit Reports**.
   - Multi-tenant tenant isolation and single-admin role-based governance.

---

## 2. Technology Stack & Architectural Overview

```
                          ┌──────────────────────────────────────────────┐
                          │               USER BROWSER                   │
                          │   React 18 + Vite + Tailwind/Vanilla CSS     │
                          │   Recharts + Lucide Icons + React Router v6  │
                          └──────────────────────┬───────────────────────┘
                                                 │ HTTPS / JSON / JWT
                                                 ▼
                          ┌──────────────────────────────────────────────┐
                          │            FASTAPI BACKEND (Python)          │
                          │  • OAuth2 JWT Auth & Bcrypt Hashing          │
                          │  • Telemetry Ingestion (Pandas / OpenPyXL)   │
                          │  • GHG Protocol Emission Service             │
                          │  • ML Carbon Leak Anomaly Detection          │
                          │  • Rule-Based Recommendation Engine          │
                          │  • Monte Carlo What-If Simulation Service    │
                          └──────────────────────┬───────────────────────┘
                                                 │ SQLAlchemy ORM
                                                 ▼
                          ┌──────────────────────────────────────────────┐
                          │            POSTGRESQL 17 DATABASE            │
                          │  • users            • facilities             │
                          │  • process_data     • data_uploads           │
                          │  • leak_anomalies   • recommendations        │
                          │  • emission_factors • audit_logs             │
                          └──────────────────────────────────────────────┘
```

### Core Technologies
- **Backend**: FastAPI 0.115+, Python 3.14, SQLAlchemy 2.0+, Pydantic v2, Pandas 2.2+, OpenPyXL, Scikit-learn, Passlib (Bcrypt), PyJWT, AnyIO, Pytest.
- **Frontend**: React 18, Vite 8, React Router v6, Recharts, Lucide React, Axios / Native Fetch.
- **Database**: PostgreSQL 17 (`circuleak` database on port 5432).
- **Standards Compliance**: ISO 14064, GHG Protocol Corporate Standard (Scope 1 & Scope 2), Ellen MacArthur Foundation Material Circularity Indicator (MCI).

---

## 3. Chronological Development History (First to Last)

Below is the complete timeline of commits and architectural milestones implemented across the repository:

### Stage 1: Initial Prototype & UI Foundation
- **Commit `38e2984` & `23233b3`**: Initial commit and Frontend V1.0 structure. Created UI screens (Executive Dashboard, Leaks, Emissions, Benchmark) using hardcoded mock objects in `src/data/`.

### Stage 2: Live FastAPI Backend & Mathematical Baseline
- **Commit `712d2dd` & `56cc743`**: Built the complete FastAPI backend architecture. Implemented Scope 1 & 2 calculation rules, industrial emission factor libraries (CEA Indian Grid v19, US eGRID, natural gas, diesel, coal), and early seed scripts.

### Stage 3: PostgreSQL 17 Dynamic Database Migration
- **Commit `2667dc2` & `c7dc4c5`**: Replaced SQLite with enterprise PostgreSQL 17. Implemented automated database creation logic (`database_exists` / `create_database`), connection pooling, and URL-safe credential escaping for passwords with special symbols.

### Stage 4: Enterprise Authentication & Multi-Tenant Access Control
- **Commit `ea9ed9b` & `c7c48b3`**: 
  - Implemented JWT token issuance, bcrypt password hashing, and user registration.
  - Linked each registered user to a dedicated facility record.
  - Added token expiration handling, automatic 401 interception, and route guards.
  - Created the Administrative Console (`/admin`) for user management and platform audits.

### Stage 5: The Dynamic Transformation (Zero-Mock Policy)
- **Commit `61e973d`**:
  - **Deleted all 10 mock files** in `frontend/src/data/` (`dashboardMock.js`, `emissionsMock.js`, `leaksMock.js`, etc.).
  - Stripped `runtimeMockOverride` and simulated latencies from `apiClient.js` and all 13 frontend API service files.
  - Replaced fallback constants (`12450`, `3150`, `4544`, `101`, `650000`) with dynamic data hooks.
  - Introduced honest empty states (`has_data: false`) when a facility has not yet uploaded telemetry.

### Stage 6: Dual CSV & Excel (XLSX) Ingestion Pipeline
- **Commit `24a77fc`**:
  - Built an ingestion engine capable of parsing both raw CSV and multi-tab Microsoft Excel (`.xlsx`) spreadsheets using Pandas and OpenPyXL.
  - Implemented token-boundary regex matching for canonical column mapping (`fuel_quantity` vs `fuel_type`, `electricity_kwh` vs `kwh`).
  - Added dynamic 5-dimension data quality score: Completeness, Timeliness, Sensor Consistency, Outlier Anomaly, and Balance Score.

### Stage 7: Production Landing Page & Single-Admin Hardening
- **Commit `c64263e` & `c0fd6e5`**:
  - Designed and launched the public SaaS Landing Page (`/`) with an industrial dark aesthetic, hero telemetry status pill, and 4-stage pipeline explainer.
  - Enforced single-admin governance (`admin@circuleak.com`); removed dangerous "Switch to Admin" demo toggles.
  - Resolved React object-child rendering errors in `InterventionTimeline.jsx`.

### Stage 8: Dynamic Multi-Day Dataset Generator & Dashboard Metrics Resolution
- **Commit `a129c93` & `c2d0e89`**:
  - Built a dynamic 288-row multi-day industrial telemetry generator (`/api/upload/template`) producing fresh randomized data with off-hours pneumatic and furnace thermal holding leaks on every click.
  - Fixed dashboard metric unpacking for Flagged Leaks, Achievable Abatement, and Annual Cost Recovery.
  - Resolved the 24-hour diurnal shift telemetry curve and normalized equipment hotspot emissions.

---

## 4. Full Breakdown of Built Modules & Pages

### 1. Public SaaS Landing Page (`/`)
- **Purpose**: Welcoming and orienting new industrial users, explaining the 4-stage carbon intelligence lifecycle, and directing users to registration or the live console.
- **Key Elements**:
  - Industrial Dark Mode header with dynamic authentication buttons ("Open Console" vs "Sign In").
  - Live SCADA telemetry status pill with real-time heartbeat.
  - Value propositions: Leak Isolation, Capital Breakeven Projections, and ISO 14064 Compliance.
  - 4-Stage SCADA ingestion pipeline diagram.
  - Feature showcase grid covering all 6 core analysis engines.

### 2. Authentication System (`/login`, `/register`)
- **Purpose**: Secure multi-tenant onboarding and credential issuance.
- **Features**:
  - Industry sector selection on registration (Metals, Textiles, Chemicals, Cement, Automotive, Food Processing).
  - Immediate facility creation and automatic tenant linking upon registration.
  - Bcrypt password hashing (`cost=12`) and JWT bearer token storage.
  - Single-admin enforcement (`admin@circuleak.com` strictly holds `is_admin=True`).

### 3. Facility Setup & Operational Parameters (`/facility`)
- **Purpose**: Managing facility metadata, geographical emission grid factor binding, and active production lines.
- **Features**:
  - Dynamic editing of facility business name, operational capacity, and state/regional grid selection.
  - Overview of configured machinery and equipment telemetry IDs.

### 4. Telemetry Data Ingestion Pipeline (`/data-upload`)
- **Purpose**: High-throughput ingestion of industrial machine logs and energy meters.
- **Features**:
  - **Dynamic Sample Generator**: Generates 288 rows (3 days $\times$ 24 hours across 4 industrial machines) in CSV or XLSX format on demand with randomized values.
  - **Dropzone File Upload**: Supports `.csv`, `.xlsx`, and `.xls`.
  - **Canonical Column Mapping**: Auto-identifies and maps columns (`timestamp`, `machine_id`, `process`, `electricity_kwh`, `fuel_type`, `fuel_consumed`, `production_units`).
  - **Immediate Calculation**: Automatically triggers row-by-row Scope 1 and Scope 2 emission calculations, inserts records into PostgreSQL, and runs anomaly detection.

### 5. Executive Carbon Dashboard (`/dashboard`)
- **Purpose**: C-suite industrial carbon command center.
- **Features**:
  - **Card 1 (Daily Plant Footprint)**: Real-time kgCO₂e/day, annual tCO₂e projection, and carbon intensity per production unit.
  - **Card 2 (Flagged Carbon Leaks)**: Critical vs total active leak count, peak anomaly machine identification, and operational status badge.
  - **Card 3 (Achievable Abatement)**: Daily achievable carbon savings (-kgCO₂e/day) and net percentage footprint reduction.
  - **Card 4 (Annual Cost Recovery)**: Recurring annual INR savings, capital expenditure requirement, and payback period in years.
  - **24-Hour Diurnal Shift Telemetry Chart**: Area chart comparing actual measured energy/emissions against the operational 85% baseline across all 24 hours (Night, Morning, and Evening shifts).
  - **Facility Carbon Hotspots Table**: Ranked machinery emission contributions with percentage shares and diagnostic links.

### 6. Emission Intelligence & Categorical Breakdown (`/emissions`)
- **Purpose**: Detailed categorical greenhouse gas accounting conforming to ISO 14064.
- **Features**:
  - Multi-tab breakdown: By Energy Source (Grid Electricity, Natural Gas, Diesel, Coal), By Process Area, and By Equipment.
  - Carbon intensity analytics per metric ton of product manufactured.
  - Interactive Sankey Flow Diagram visualizing energy carrier inputs flowing through process stages to finished goods or carbon leaks.

### 7. Carbon Leak Point Registry & Diagnostics (`/leaks`, `/leaks/:id`)
- **Purpose**: Statistical and ML-driven anomaly detection isolating avoidable industrial energy waste.
- **Features**:
  - **Detection Algorithm**: Analyzes baseline power during non-production shifts (22:00–06:00). Machines drawing power during inactive hours are flagged.
  - Anomaly cards detailing: Equipment name, Process area, Risk score (0–100), Observed vs Baseline consumption, and Excess kgCO₂e bleed.
  - Root cause diagnostic guidance (e.g. pneumatic valve failure, compressor continuous idling, uninsulated thermal ovens).

### 8. Circular Alternatives & Recommendations (`/recommendations`)
- **Purpose**: Formulating ROI-ranked circular economy and energy efficiency engineering packages.
- **Features**:
  - Recommendations tailored to flagged leaks (e.g. Ultrasonic leak audit, Variable Frequency Drive retrofit, Waste Heat Recovery recuperator installation).
  - Detailed financial metrics: Estimated Capital Outlay (INR), Annual Cost Savings (INR), CO₂ Reduction (kg/yr), and Simple Payback Period (years).

### 9. Strategic Action Planner (`/action-planner`)
- **Purpose**: Phased implementation roadmapping for decarbonization projects.
- **Features**:
  - Phased Gantt-style deployment: Phase 1 (Quick Wins, < 6 mo payback), Phase 2 (Process Optimization), Phase 3 (Major Capital Projects).
  - Cumulative capital outlay vs cumulative annual cost savings curves.

### 10. What-If Carbon & Financial Simulator (`/simulation`)
- **Purpose**: Interactive operational sandbox for facility engineers.
- **Features**:
  - Sliders for Operational Variables: Production volume adjustment, Renewable power percentage (solar PPA/rooftop), Fuel switching (Coal/Diesel $\rightarrow$ Biomass/PNG), and Leak Sealing adoption.
  - Instant live recalculation of revised daily footprint, cost variance, and net emission abatement.

### 11. 5-Year Net-Zero Trajectory Forecaster (`/trajectory`)
- **Purpose**: Long-term carbon reduction trajectory modeling against Science Based Targets (SBTi).
- **Features**:
  - Visual projections comparing "Business As Usual" (BAU) against "CircuLeak Circular Path".
  - Annual milestone markers for 2026 through 2031.

### 12. Peer Sector Benchmarking (`/benchmark`)
- **Purpose**: Comparing facility carbon performance against regional industrial peers.
- **Features**:
  - Quartile positioning: Top 10% Leaders, Average Industry Median, and High-Emitting Decile.
  - Sector-specific benchmarking for Textiles, Metals, Chemicals, and Engineering.

### 13. Material Circularity Index (`/circularity`)
- **Purpose**: Measuring circular economy maturity using the Ellen MacArthur Foundation MCI framework.
- **Features**:
  - Scoring (0.00 to 1.00) across 4 circular dimensions: Virgin Feedstock Reduction, Recycled Input Share, Product Durability/Lifespan, and Waste Valorization.

### 14. 12-Section Industrial Audit Memorandum (`/audit-report`)
- **Purpose**: Formal compliance report for environmental audits, bank sustainability-linked loans, and regulatory submissions.
- **Features**:
  - Complete 12-section technical dossier covering Facility Profile, Scope 1 & 2 Emissions, Hotspot Hierarchy, Anomaly Diagnostics, and Circular CapEx Roadmap.
  - Client-side export to print/PDF.

### 15. Superadmin Governance Console (`/admin`)
- **Purpose**: Platform administration and audit monitoring for authorized administrators (`admin@circuleak.com`).
- **Features**:
  - User Directory: View all registered users, roles, email addresses, and linked facility IDs.
  - Facility Directory: View all provisioned industrial sites and production sectors.
  - Telemetry Ingestion Audit Log: Record of all uploads, filenames, row counts, and data quality scores.
  - Live Analytical Event Stream: Real-time ledger of calculations, leak detections, and simulations.

---

## 5. Database Schema Architecture (PostgreSQL 17)

| Table Name | Primary Purpose | Key Columns |
|---|---|---|
| `users` | User credentials and roles | `id`, `email`, `hashed_password`, `full_name`, `role`, `is_admin`, `is_active`, `facility_id` |
| `facilities` | Industrial facility metadata | `id`, `business_name`, `sector`, `state_province`, `grid_emission_factor`, `capacity` |
| `process_data` | Ingested hourly machine logs | `id`, `facility_id`, `timestamp`, `equipment_name`, `process_area`, `electricity_kwh`, `fuel_consumed`, `calculated_emissions_kg` |
| `data_uploads` | File ingestion audit trail | `id`, `facility_id`, `filename`, `file_format`, `total_rows`, `valid_rows`, `quality_score` |
| `leak_anomalies` | Detected carbon leaks | `id`, `facility_id`, `equipment_name`, `process_area`, `risk_score`, `excess_emissions_kg`, `abnormal_period` |
| `recommendations`| Circular engineering packages | `id`, `facility_id`, `title`, `target_equipment`, `estimated_cost_inr`, `annual_savings_inr`, `co2_reduction` |
| `emission_factors`| Statutory emission factors | `id`, `energy_source`, `unit`, `emission_factor_kg_co2e`, `region`, `source_reference` |
| `audit_logs` | Immutable system event ledger | `id`, `facility_id`, `user_id`, `action`, `resource_type`, `details`, `created_at` |
| `analysis_rules` | Dynamic anomaly thresholds | `id`, `facility_id`, `rule_name`, `threshold_value`, `is_active` |

---

## 6. Verification and Validation Results

- **Automated Backend Tests (`pytest`)**:
  - `test_health_check`: PASSED
  - `test_template_download_csv_and_xlsx`: PASSED
  - `test_single_admin_and_role_security`: PASSED
  - `test_full_pipeline_flow`: PASSED
  - `test_emission_factors_library`: PASSED
  - `test_calculate_emissions_for_row`: PASSED
  - `test_feature_engineering`: PASSED
  - `test_anomaly_detection_detects_off_hours_idle_leak`: PASSED
  - `test_recommendation_library_validity`: PASSED
  - `test_semantic_matching_on_boiler`: PASSED
  - `test_what_if_simulator`: PASSED
  - **Result**: `11 passed, 100% success rate`.
- **Frontend Production Build (`vite build`)**:
  - Built clean production bundle in **723ms** with 0 errors.

---

## 7. Conclusion

CircuLeak is fully implemented, end-to-end dynamic, mathematically validated, securely multi-tenanted, and operating on PostgreSQL 17. All features from user registration to telemetry ingestion, leak detection, and executive reporting are operating with live data.
