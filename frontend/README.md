# CircuLeak — Frontend

> **Industrial Emission Leak-Point Detector & Circular Alternative Recommender**  
> Built for the 48-hour Hackathon. Ready for instant demo with unified industrial facility data and plug-and-play integration with the separate Python/FastAPI backend.

---

## 1. Project Overview

CircuLeak helps industrial manufacturing enterprises answer four fundamental questions:
1. **WHERE?** Where are the biggest carbon/emission leaks occurring in the facility?
2. **WHY?** Why did CircuLeak flag them? (Baseline consumption vs observed operating data across operational shifts).
3. **WHAT?** What circular alternatives and engineering interventions can eliminate those leaks?
4. **WHAT IF?** What happens financially and environmentally if those alternatives are implemented?

---

## 2. Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (Structured industrial aesthetic, high readability, semantic indicators)
- **Routing**: React Router v7 (`react-router-dom`)
- **Visualizations**: Recharts (Custom industrial tooltips and high-contrast curves)
- **Icons**: Lucide React
- **HTTP Client**: Native `fetch()` with centralized error-handling, timeout, and explicit mock mode toggle

---

## 3. Directory Structure

```text
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx           # App shell with Sidebar, Topbar, and Breadcrumbs
│   │   │   ├── Sidebar.jsx             # Grouped navigation with 13 routes and status badges
│   │   │   ├── Topbar.jsx              # Active facility profile & Demo/Live mode toggle pill
│   │   │   ├── Breadcrumbs.jsx         # Hierarchical trail tracking
│   │   │   └── PageHeader.jsx          # Consistent page titles, subtitles, and action triggers
│   │   ├── ui/
│   │   │   ├── Button.jsx              # Primary, secondary, outline, danger, ghost variants
│   │   │   ├── Badge.jsx               # Semantic status pills
│   │   │   ├── StatusBadge.jsx         # Critical (80+), High, Medium, Low risk badges
│   │   │   ├── MetricCard.jsx          # Industrial KPI cards with unit, delta, and subtext
│   │   │   ├── SectionCard.jsx         # Structured bordered containers with header slots
│   │   │   ├── EmptyState.jsx          # Guided empty action states
│   │   │   ├── LoadingState.jsx        # Skeleton loaders with progressive feedback
│   │   │   ├── ErrorState.jsx          # Structured API error banner with demo fallback
│   │   │   ├── Modal.jsx               # Accessible dialog modal
│   │   │   ├── ProgressBar.jsx         # Single and multi-color progress indicators
│   │   │   └── Tooltip.jsx             # Informative hover popovers
│   │   ├── dashboard/                  # Executive summary, hotspots, anomalies, reduction
│   │   ├── emissions/                  # Direct & energy-related breakdown, timeline, intensity
│   │   ├── leaks/                      # Registry table, "WHY WAS THIS FLAGGED?", 24h window
│   │   ├── recommendations/            # Capex/Opex cards, 2x2 priority matrix, engineering specs
│   │   ├── simulation/                 # What-If simulator, checkboxes, financial impact, presets
│   │   ├── trajectory/                 # 2026-2030 BAU vs Action curve, cumulative savings
│   │   ├── benchmark/                  # Intensity gap vs industry average & peer cluster
│   │   ├── circularity/                # 0-100 overall index and 5 pillar breakdown
│   │   ├── audit/                      # AI executive memorandum, findings, report triggers
│   │   └── upload/                     # CSV dropzone, schema validation, ingestion summary
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Facility.jsx
│   │   ├── DataUpload.jsx
│   │   ├── Emissions.jsx
│   │   ├── Leaks.jsx
│   │   ├── LeakDetails.jsx
│   │   ├── Recommendations.jsx
│   │   ├── ActionPlanner.jsx
│   │   ├── Simulation.jsx
│   │   ├── Trajectory.jsx
│   │   ├── Benchmark.jsx
│   │   ├── Circularity.jsx
│   │   └── AuditReport.jsx
│   ├── context/
│   │   └── FacilityContext.jsx         # Global active facility and demo mode state
│   ├── hooks/                          # 10 domain custom hooks
│   ├── services/                       # Centralized apiClient + 11 domain API modules
│   ├── data/                           # Unified Apex Metals & Casting Unit 4 mock dataset
│   ├── utils/                          # Currency, CO2, intensity, percent formatters
│   ├── constants/                      # Navigation, labels, and API routes
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .env
├── package.json
├── vite.config.js
└── README.md
```

---

## 4. Single Source of Truth — Demo Facility Narrative

All screens and mock datasets represent **one mathematically reconciled facility**:

- **Facility**: `FAC-8842: Apex Metals & Casting Unit 4`
- **Location**: Vadodara Industrial Estate, Gujarat, India (280 employees, 24/7 operating model)
- **Production Volume**: `45,000 metric tons / year` (~`123.3 tonnes/day`)
- **Total Emissions**: `12,450 kgCO₂e / day` (Annualized baseline: ~`4,544 tCO₂e / year`)
- **Production Intensity**: **`101 kgCO₂e / metric ton product`**
- **Flagged Anomaly (Compressor 03)**:
  - Baseline: `42 kWh/day` idle baseline
  - Observed Operating Data: `61 kWh/day`
  - Deviation: `+45%`
  - Abnormal Period: `22:00 — 04:00` (Night shift, non-production)
  - Root Cause: *"Energy consumption is 45% above expected baseline during scheduled non-production hours due to unloader valve bypass leak."*
- **Recommended Package**:
  1. *Compressor Off-Hours Sequencing*: Capex ₹80k, Savings ₹1.6L/yr, Payback: 0.5 yrs
  2. *Furnace Waste Heat Recovery*: Capex ₹2.5L, Savings ₹1.2L/yr, Payback: 2.1 yrs
  3. *Cooling Water Recirculation & VFD*: Capex ₹1.2L, Savings ₹60k/yr, Payback: 2.0 yrs
  4. *Rooftop Solar PV PPA*: Capex ₹2.0L, Savings ₹80k/yr, Payback: 2.5 yrs
- **Combined Financial & Carbon Impact**:
  - Baseline Emissions: `12,450 kgCO₂e/day` → Projected: `9,300 kgCO₂e/day`
  - Reduction: `3,150 kgCO₂e/day` (**25.3% net cut**)
  - Total Capex: **`₹6,50,000`**
  - Annual Savings: **`₹4,20,000`**
  - Simple Payback: **`1.55 years`** ($\frac{6,50,000}{4,20,000} = 1.5476$)
  - 5-Year Cumulative Savings: **`₹21,00,000`** ($5 \times 4,20,000$)
- **Benchmark Alignment**:
  - Facility Intensity: `101 kgCO₂e / metric ton product`
  - Industry Benchmark: `85 kgCO₂e / metric ton product` (Gap: **`+18.8%`**)
  - Peer Cluster (24 similar heavy alloy casting plants): `88 kgCO₂e / metric ton product` (Gap: `+14.8%`)
- **Circularity Score**: **`64 / 100`** (Material: 58, Waste: 72, Renewable: 48, Efficiency: 71, Carbon: 60), projectable to `83 / 100`.

---

## 5. Environment Variables & API Integration

Configured in `.env`:

```env
# Backend API Base URL
VITE_API_URL=http://localhost:8000/api

# Explicit Mock Mode Switch
# true  -> Uses unified industrial demo dataset (offline demo mode)
# false -> Calls live FastAPI backend
VITE_USE_MOCK=true
```

### Live vs Demo Indicator
The Topbar provides an active indicator pill:
- `● Demo Data` (Amber) when running in mock mode.
- `● Live API` (Emerald) when connected to FastAPI.
- Clicking the pill dynamically toggles between offline demo mode and live API mode for seamless presentations.
- If `VITE_USE_MOCK=false` and FastAPI is unreachable, CircuLeak displays an informative API Error Banner with a one-click button to temporarily engage offline demo data.

---

## 6. Supported Routes (13 Core Screens)

| Route | Page | Description |
|---|---|---|
| `/dashboard` | Executive Dashboard | High-level KPIs, emission breakdown, top hotspots, anomaly flags |
| `/facility` | Facility Setup | Operational profile, energy carriers, machinery inventory |
| `/data-upload` | Data Ingestion | Process CSV upload dropzone, schema verification, sample download |
| `/emissions` | Emission Intelligence | Source breakdown, processes, machinery rankings, 30-day timeline |
| `/leaks` | Carbon Leak Points | Filterable anomaly table, risk severity tiers, hotspot visualizer |
| `/leaks/:id` | Leak Details | **"WHY WAS THIS FLAGGED?"** baseline vs observed 24h curve |
| `/recommendations` | Circular Alternatives | Intervention cards, Capex/Opex savings, 2x2 priority matrix |
| `/action-planner` | Action Planner | Phased deployment roadmap (Immediate to Long Term) |
| `/simulation` | What-If Simulator | Candidate checkboxes, live before/after modeling, scenario cards |
| `/trajectory` | 5-Year Trajectory | 2026-2030 BAU vs Action curve, cumulative financial savings |
| `/benchmark` | Industry Benchmark | Facility vs sector benchmark (101 vs 85 kgCO₂e/t), 24-plant peer cluster |
| `/circularity` | Circularity Index | 0-100 overall gauge and 5 circularity pillars |
| `/audit-report` | Audit Report | Executive consulting memorandum, certified findings, PDF/Print actions |

---

## 7. Development Commands

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start local development server
npm run dev

# Run production build
npm run build

# Preview production bundle
npm run preview
```

---

## 8. Backend Contract Verification Checklist

- [x] Base URL configurable via `VITE_API_URL`
- [x] Mock data isolated under `src/data/`
- [x] Zero hardcoded business logic or client-side calculation of ML anomaly scores
- [x] Payback mathematically exact ($6,50,000 / $4,20,000 = 1.55 years)
- [x] Specific intensity explicitly defined in `kgCO₂e / metric ton product`
- [x] Benchmark gap mathematically consistent (+18.8%)
- [x] No undefined financial metrics (no NPV/IRR)
- [x] No undefined export endpoints (PDF Preview and Print supported)
- [x] Every component in its own isolated file
