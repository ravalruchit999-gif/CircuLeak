"""
CircuLeak Circular Recommendations Knowledge Base.
Curated list of real-world industrial decarbonization and circular economy interventions,
backed by published energy auditor case studies (BEE, UNIDO, IPCC).

Maintains strict architectural separation between published [REFERENCE] case-study
parameters and factory-specific [SCENARIO] calculations.
"""

from typing import List, Dict, Any

DEFAULT_RECOMMENDATIONS: List[Dict[str, Any]] = [
    {
        "id": "whr_boiler_flue",
        "title": "Boiler Flue Gas Waste Heat Recovery (Economizer)",
        "description": "Install a shell-and-tube economizer in the boiler exhaust flue gas duct to preheat boiler feed water from 30°C to 85°C, reducing fuel consumption by 5-8%.",
        "target_process": "Steam Generation",
        "target_equipment": "Boiler",
        "intervention_type": "waste_heat_recovery",
        "intervention_category": "heat_recovery",
        "supported_sectors": ["Textile & Garment Dyeing", "Metals & Heavy Alloys", "Chemical & Fertilizer Processing", "Food & Beverage Processing", "General Manufacturing"],
        "supported_processes": ["Steam Generation", "Water Heating", "Thermal Processing"],
        "supported_equipment": ["Boiler", "Furnace"],
        "applicable_problem_types": ["thermal_efficiency_drop", "excess_air_ratio", "combustion_inefficiency", "fuel_leak", "high_flue_gas_temp", "specific_energy_consumption_spike"],
        "objective_tags": ["payback", "carbon", "circularity"],
        "prerequisites": {
            "min_flue_gas_temp_c": 160.0,
            "continuous_steam_demand": True,
            "duct_clearance_meters": 1.5
        },
        "required_telemetry": ["fuel_rate"],
        "optional_telemetry": ["steam_output", "flue_gas_temp", "oxygen_pct"],
        "contraindications": [
            "Exhaust flue gas temperature below 150°C (severe acid dew point corrosion risk)",
            "High-sulfur heavy fuel oil without corrosion-resistant alloys",
            "Intermittent or batch steam demand (< 4 hours continuous run per day)"
        ],
        "implementation_constraints": [
            "Requires 24-48 hr scheduled boiler shutdown for duct fabrication and hydraulic tie-in",
            "Feedwater pump head verification for pressure drop through economizer coils (0.5-1.0 bar)"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "base_capex_inr": 350000.0,
                "piping_valve_allowance_inr": 45000.0,
                "installation_labor_pct": 0.15
            },
            "valid_ranges": {"base_capex_inr": [250000.0, 750000.0]},
            "valid_units": {"base_capex_inr": "INR"},
            "calculation_basis": "Capex = (base_capex + piping_valves) * (1 + installation_labor_pct)"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.03},
            "valid_ranges": {"maintenance_rate_pct": [0.01, 0.08]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * maintenance_rate_pct"
        },
        "savings_model": {
            "model_type": "percentage_fuel_reduction",
            "formula_version": "1.0.0",
            "input_variables": ["fuel_rate", "fuel_cost_per_unit"],
            "parameters": {
                "lower_bound_pct": 0.045,
                "expected_pct": 0.065,
                "upper_bound_pct": 0.085
            },
            "valid_ranges": {"expected_pct": [0.03, 0.12]},
            "valid_units": {"expected_pct": "fraction", "fuel_rate": "kg/hr or m3/hr"},
            "calculation_basis": "Annual Savings = Annual Fuel Baseline * fuel_cost_per_unit * savings_pct"
        },
        "carbon_reduction_model": {
            "model_type": "emission_factor_multiplication",
            "formula_version": "1.0.0",
            "parameters": {"scope": "Scope 1"},
            "calculation_basis": "CO2 Abated = Annual Fuel Saved * Official Emission Factor (kgCO2e/unit)"
        },
        "waste_reduction_model": {},
        "revenue_model": {},
        "implementation_complexity": "Medium",
        "operational_disruption": "Medium",
        "risk_level": "Low",
        "feasibility": "High",
        "is_standard": True,
        "is_active": True,
        "reference_type": "Industrial Energy Audit Case Study",
        "reference_title": "Best Available Techniques in Industrial Steam Generation",
        "reference_organization": "Bureau of Energy Efficiency (BEE)",
        "reference_url_or_document": "BEE Industrial Energy Audit Manual - Boilers (2022)",
        "reference_year": 2022,
        "reference_parameter": "Flue gas heat recovery fuel reduction",
        "reference_parameter_range": "5% - 8% fuel savings",
        "reference_applicability_notes": "Economizers provide ~1% efficiency gain per 22°C drop in flue gas temperature, provided gas temperature remains safely above sulfuric acid dew point (~140°C).",
        "requirements": "Space in flue gas ducting, exhaust temperature > 180°C, continuous steam demand.",
        "estimated_co2_reduction_annual_kg": 18500.0,
        "estimated_cost_inr": 350000.0,
        "annual_savings_inr": 180000.0,
        "payback_period_years": 1.94,
        "keywords": ["boiler", "flue", "exhaust", "economizer", "steam", "heat", "preheat"]
    },
    {
        "id": "air_leak_audit_repair",
        "title": "Ultrasonic Compressed Air Leak Audit & Sealing",
        "description": "Perform comprehensive ultrasonic leak survey across pneumatic distribution lines and replace damaged couplings, quick-connect fittings, and leaking valves. Eliminates 20-30% artificial demand.",
        "target_process": "Compressed Air",
        "target_equipment": "Compressor",
        "intervention_type": "energy_efficiency",
        "intervention_category": "operational_optimization",
        "supported_sectors": ["Textile & Garment Dyeing", "Metals & Heavy Alloys", "Chemical & Fertilizer Processing", "Food & Beverage Processing", "General Manufacturing"],
        "supported_processes": ["Compressed Air", "Auxiliary Operations", "Material Handling"],
        "supported_equipment": ["Compressor", "Pneumatics"],
        "applicable_problem_types": ["unloaded_idle_runtime", "off_hours_idle_waste", "standby_idle_energy_loss", "pressure_drop", "flow_rate_spike", "system_leak"],
        "objective_tags": ["payback", "capex", "disruption", "carbon"],
        "prerequisites": {
            "air_distribution_network_length_m": 50.0,
            "min_working_pressure_bar": 4.0
        },
        "required_telemetry": ["energy_kwh"],
        "optional_telemetry": ["flow_rate", "pressure_bar"],
        "contraindications": [
            "Completely closed or inaccessible overhead piping without platform access",
            "Compressor operating at continuous 100% full-load modulation without pressure cycling"
        ],
        "implementation_constraints": [
            "Audit conducted during regular shift; physical sealing and fitting replacement scheduled during weekend downtime (4-8 hours)"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "audit_tool_labor_inr": 25000.0,
                "replacement_fittings_valves_inr": 20000.0
            },
            "valid_ranges": {"audit_tool_labor_inr": [15000.0, 50000.0]},
            "valid_units": {"audit_tool_labor_inr": "INR"},
            "calculation_basis": "Capex = audit_labor + replacement_hardware"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.10},
            "valid_ranges": {"maintenance_rate_pct": [0.05, 0.20]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Bi-annual leak surveillance check = 10% of initial Capex"
        },
        "savings_model": {
            "model_type": "percentage_energy_reduction",
            "formula_version": "1.0.0",
            "input_variables": ["energy_kwh", "electricity_tariff_inr_kwh"],
            "parameters": {
                "lower_bound_pct": 0.15,
                "expected_pct": 0.22,
                "upper_bound_pct": 0.30
            },
            "valid_ranges": {"expected_pct": [0.10, 0.35]},
            "valid_units": {"expected_pct": "fraction", "energy_kwh": "kWh"},
            "calculation_basis": "Annual Savings = Compressor Annual kWh * electricity_tariff * savings_pct"
        },
        "carbon_reduction_model": {
            "model_type": "emission_factor_multiplication",
            "formula_version": "1.0.0",
            "parameters": {"scope": "Scope 2"},
            "calculation_basis": "CO2 Abated = Annual kWh Saved * CEA Grid Emission Factor (0.716 kgCO2e/kWh)"
        },
        "waste_reduction_model": {},
        "revenue_model": {},
        "implementation_complexity": "Low",
        "operational_disruption": "Low",
        "risk_level": "Low",
        "feasibility": "High",
        "is_standard": True,
        "is_active": True,
        "reference_type": "Industrial Energy Audit Case Study",
        "reference_title": "Compressed Air Systems Energy Efficiency Guidelines",
        "reference_organization": "UNIDO Industrial Energy Accelerator",
        "reference_url_or_document": "UNIDO Compressed Air Efficiency Assessment Guide (2021)",
        "reference_year": 2021,
        "reference_parameter": "Systemic leak reduction percentage",
        "reference_parameter_range": "20% - 30% compressed air electrical load reduction",
        "reference_applicability_notes": "Industrial compressed air systems typically exhibit 20-30% loss to ambient through damaged push-in fittings, deteriorated O-rings, and cracked polyurethane tubing.",
        "requirements": "Ultrasonic leak detector, maintenance technician team, scheduled weekend downtime.",
        "estimated_co2_reduction_annual_kg": 9200.0,
        "estimated_cost_inr": 45000.0,
        "annual_savings_inr": 120000.0,
        "payback_period_years": 0.38,
        "keywords": ["compressor", "air", "leak", "pneumatic", "pressure", "coupling"]
    },
    {
        "id": "vfd_compressor_retrofit",
        "title": "Variable Frequency Drive (VFD) Retrofit on Air Compressor",
        "description": "Retrofit smart variable frequency drive on fixed-speed screw compressors to modulate motor speed with real-time pressure demand, eliminating unloaded idle electricity consumption.",
        "target_process": "Compressed Air",
        "target_equipment": "Compressor",
        "intervention_type": "equipment_optimization",
        "intervention_category": "equipment_upgrade",
        "supported_sectors": ["Textile & Garment Dyeing", "Metals & Heavy Alloys", "Chemical & Fertilizer Processing", "Food & Beverage Processing", "General Manufacturing"],
        "supported_processes": ["Compressed Air", "Fluid & Air Movement"],
        "supported_equipment": ["Compressor", "Pump", "Blower"],
        "applicable_problem_types": ["unloaded_idle_runtime", "off_hours_idle_waste", "flow_rate_spike", "thermal_efficiency_drop"],
        "objective_tags": ["carbon", "payback", "circularity"],
        "prerequisites": {
            "compressor_motor_inverter_duty": True,
            "variable_demand_ratio_pct": 25.0
        },
        "required_telemetry": ["energy_kwh"],
        "optional_telemetry": ["flow_rate", "operating_hours"],
        "contraindications": [
            "Compressor continuously operates at flat 100% full-load output without unload cycles",
            "Old class B motor insulation without harmonic filtering (inverter-spike insulation breakdown risk)"
        ],
        "implementation_constraints": [
            "Requires control panel line reactor, output dv/dt filter, and 1-day installation downtime"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "drive_hardware_inr": 170000.0,
                "filters_reactors_inr": 30000.0,
                "commissioning_inr": 20000.0
            },
            "valid_ranges": {"drive_hardware_inr": [100000.0, 350000.0]},
            "valid_units": {"drive_hardware_inr": "INR"},
            "calculation_basis": "Capex = drive + filters + commissioning"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.02},
            "valid_ranges": {"maintenance_rate_pct": [0.01, 0.05]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * 0.02"
        },
        "savings_model": {
            "model_type": "percentage_energy_reduction",
            "formula_version": "1.0.0",
            "input_variables": ["energy_kwh", "electricity_tariff_inr_kwh"],
            "parameters": {
                "lower_bound_pct": 0.12,
                "expected_pct": 0.18,
                "upper_bound_pct": 0.25
            },
            "valid_ranges": {"expected_pct": [0.10, 0.30]},
            "valid_units": {"expected_pct": "fraction"},
            "calculation_basis": "Annual Savings = Annual kWh * electricity_tariff * savings_pct"
        },
        "carbon_reduction_model": {
            "model_type": "emission_factor_multiplication",
            "formula_version": "1.0.0",
            "parameters": {"scope": "Scope 2"},
            "calculation_basis": "CO2 Abated = Annual kWh Saved * CEA Grid Emission Factor (0.716 kgCO2e/kWh)"
        },
        "waste_reduction_model": {},
        "revenue_model": {},
        "implementation_complexity": "Medium",
        "operational_disruption": "Medium",
        "risk_level": "Low",
        "feasibility": "High",
        "is_standard": True,
        "is_active": True,
        "reference_type": "Industrial Energy Audit Case Study",
        "reference_title": "Energy Conservation in Motor Driven Systems",
        "reference_organization": "Bureau of Energy Efficiency (BEE)",
        "reference_url_or_document": "BEE Technology Case Study Series: Motor VFD Retrofits (2020)",
        "reference_year": 2020,
        "reference_parameter": "Unloaded compressor electrical energy savings",
        "reference_parameter_range": "15% - 25% electricity savings on fluctuating load profiles",
        "reference_applicability_notes": "Fixed speed compressors consume 30-40% of rated power even when completely unloaded. VFD lowers motor speed linearly with pressure setpoint.",
        "requirements": "Rotary screw compressor with variable load profile, suitable motor insulation.",
        "estimated_co2_reduction_annual_kg": 14600.0,
        "estimated_cost_inr": 220000.0,
        "annual_savings_inr": 135000.0,
        "payback_period_years": 1.63,
        "keywords": ["compressor", "vfd", "variable speed", "idle", "motor", "unloaded"]
    },
    {
        "id": "auto_idle_shutdown",
        "title": "Automated Interlocking Idle-Cutoff Controllers",
        "description": "Install programmable logic controllers (PLCs) with current sensors to automatically cut power to conveyors, extractors, and ancillary equipment during batch pause > 10 minutes.",
        "target_process": "Auxiliary Operations",
        "target_equipment": "Conveyor",
        "intervention_type": "energy_efficiency",
        "intervention_category": "process_control",
        "supported_sectors": ["Textile & Garment Dyeing", "Metals & Heavy Alloys", "Chemical & Fertilizer Processing", "Food & Beverage Processing", "General Manufacturing"],
        "supported_processes": ["Auxiliary Operations", "Material Handling", "Thermal Processing", "Compressed Air"],
        "supported_equipment": ["Conveyor", "Compressor", "Pump", "Curing Oven", "Cutting Machine"],
        "applicable_problem_types": ["off_hours_idle_waste", "standby_idle_energy_loss", "unloaded_idle_runtime", "abnormal_idle_power", "operational_shift_leak"],
        "objective_tags": ["payback", "capex", "disruption", "carbon"],
        "prerequisites": {
            "batch_transition_time_min": 10.0,
            "idle_power_draw_kw": 2.0
        },
        "required_telemetry": ["energy_kwh"],
        "optional_telemetry": ["operating_hours"],
        "contraindications": [
            "Equipment requiring extended thermal soak or continuous lubrication circulation",
            "Emergency cooling or safety exhaust ventilation systems"
        ],
        "implementation_constraints": [
            "Sensor integration into motor control center (MCC); operator override selector required"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "plc_hardware_inr": 35000.0,
                "current_transducers_inr": 15000.0,
                "wiring_commissioning_inr": 10000.0
            },
            "valid_ranges": {"plc_hardware_inr": [20000.0, 80000.0]},
            "valid_units": {"plc_hardware_inr": "INR"},
            "calculation_basis": "Capex = controller + sensors + installation"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.05},
            "valid_ranges": {"maintenance_rate_pct": [0.02, 0.10]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * 0.05"
        },
        "savings_model": {
            "model_type": "percentage_energy_reduction",
            "formula_version": "1.0.0",
            "input_variables": ["energy_kwh", "electricity_tariff_inr_kwh"],
            "parameters": {
                "lower_bound_pct": 0.08,
                "expected_pct": 0.14,
                "upper_bound_pct": 0.20
            },
            "valid_ranges": {"expected_pct": [0.05, 0.25]},
            "valid_units": {"expected_pct": "fraction"},
            "calculation_basis": "Annual Savings = Annual kWh * electricity_tariff * idle_curtailment_pct"
        },
        "carbon_reduction_model": {
            "model_type": "emission_factor_multiplication",
            "formula_version": "1.0.0",
            "parameters": {"scope": "Scope 2"},
            "calculation_basis": "CO2 Abated = Annual kWh Saved * CEA Grid Emission Factor (0.716 kgCO2e/kWh)"
        },
        "waste_reduction_model": {},
        "revenue_model": {},
        "implementation_complexity": "Low",
        "operational_disruption": "Low",
        "risk_level": "Low",
        "feasibility": "High",
        "is_standard": True,
        "is_active": True,
        "reference_type": "Industrial Energy Audit Case Study",
        "reference_title": "Energy Management Systems and Automatic Shutdowns in Textile SMEs",
        "reference_organization": "Bureau of Energy Efficiency (BEE)",
        "reference_url_or_document": "BEE SME Energy Efficiency Guidebook (2022)",
        "reference_year": 2022,
        "reference_parameter": "Off-hours / inter-batch idle power curtailment",
        "reference_parameter_range": "10% - 18% auxiliary electricity curtailment",
        "reference_applicability_notes": "Ancillary drives and auxiliary conveyors often run through lunch breaks, shift changes, and setup pauses, wasting unmetered parasitic power.",
        "requirements": "Control panel wiring, sensor placement, operator protocol training.",
        "estimated_co2_reduction_annual_kg": 6400.0,
        "estimated_cost_inr": 60000.0,
        "annual_savings_inr": 75000.0,
        "payback_period_years": 0.80,
        "keywords": ["idle", "cutoff", "sensor", "interlock", "off-hours", "conveyor", "automation"]
    },
    {
        "id": "condensate_steam_recovery",
        "title": "Closed-Loop Pressurized Condensate Recovery System",
        "description": "Recover hot steam condensate from dyeing/drying processes and return directly to boiler feed tank, preserving water, chemicals, and sensible heat at 85-90°C.",
        "target_process": "Steam Distribution",
        "target_equipment": "Boiler",
        "intervention_type": "circular_material_loop",
        "intervention_category": "circular_material_loop",
        "supported_sectors": ["Textile & Garment Dyeing", "Chemical & Fertilizer Processing", "Food & Beverage Processing", "General Manufacturing"],
        "supported_processes": ["Steam Generation", "Steam Distribution", "Water Heating", "Thermal Processing"],
        "supported_equipment": ["Boiler", "Water Heater", "Dyeing Vessel"],
        "applicable_problem_types": ["condensate_loss", "thermal_efficiency_drop", "excess_fuel_consumption", "water_waste"],
        "objective_tags": ["circularity", "payback", "carbon"],
        "prerequisites": {
            "steam_consumption_tph": 1.0,
            "condensate_return_line_possible": True
        },
        "required_telemetry": ["fuel_rate"],
        "optional_telemetry": ["steam_output", "feedwater_temp_c"],
        "contraindications": [
            "Contaminated condensate with heavy oil or toxic chemical carryover that poisons boiler feedwater",
            "Open drainage systems with excessive elevation head exceeding return pump capacity"
        ],
        "implementation_constraints": [
            "Insulated return piping run of 50-150 meters; requires float steam trap replacement"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "flash_tank_pumps_inr": 180000.0,
                "piping_insulation_inr": 70000.0,
                "steam_traps_inr": 30000.0
            },
            "valid_ranges": {"flash_tank_pumps_inr": [100000.0, 400000.0]},
            "valid_units": {"flash_tank_pumps_inr": "INR"},
            "calculation_basis": "Capex = flash tank & pump + piping & insulation + traps"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.04},
            "valid_ranges": {"maintenance_rate_pct": [0.02, 0.08]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * 0.04"
        },
        "savings_model": {
            "model_type": "percentage_fuel_reduction",
            "formula_version": "1.0.0",
            "input_variables": ["fuel_rate", "fuel_cost_per_unit"],
            "parameters": {
                "lower_bound_pct": 0.04,
                "expected_pct": 0.07,
                "upper_bound_pct": 0.10
            },
            "valid_ranges": {"expected_pct": [0.03, 0.12]},
            "valid_units": {"expected_pct": "fraction"},
            "calculation_basis": "Annual Savings = Annual Fuel Baseline * fuel_cost * savings_pct + Raw Water Chemical Savings"
        },
        "carbon_reduction_model": {
            "model_type": "emission_factor_multiplication",
            "formula_version": "1.0.0",
            "parameters": {"scope": "Scope 1"},
            "calculation_basis": "CO2 Abated = Annual Fuel Saved * Official Emission Factor (kgCO2e/unit)"
        },
        "waste_reduction_model": {
            "model_type": "water_circularity",
            "formula_version": "1.0.0",
            "parameters": {"water_recovery_pct": 0.65},
            "calculation_basis": "Recovers 65% of process steam volume as treated, preheated boiler makeup water"
        },
        "revenue_model": {},
        "implementation_complexity": "Medium",
        "operational_disruption": "Medium",
        "risk_level": "Low",
        "feasibility": "High",
        "is_standard": True,
        "is_active": True,
        "reference_type": "Industrial Energy Audit Case Study",
        "reference_title": "Condensate Recovery in Process Industries",
        "reference_organization": "Bureau of Energy Efficiency (BEE)",
        "reference_url_or_document": "BEE Best Practice Manual - Steam Utilization (2021)",
        "reference_year": 2021,
        "reference_parameter": "Sensible heat and treated water recovery rate",
        "reference_parameter_range": "6% - 10% boiler fuel savings + 60% water recycle",
        "reference_applicability_notes": "Returning condensate at 85°C instead of 25°C raw makeup water saves approximately 1% fuel for every 6°C rise in feedwater temperature.",
        "requirements": "Condensate return piping, flash tank, steam trap replacement.",
        "estimated_co2_reduction_annual_kg": 16000.0,
        "estimated_cost_inr": 280000.0,
        "annual_savings_inr": 150000.0,
        "payback_period_years": 1.87,
        "keywords": ["condensate", "steam trap", "water recovery", "feedwater", "boiler", "heat"]
    },
    {
        "id": "scrap_fabric_recycling_loop",
        "title": "In-House Fabric Cutting Scrap Shredding & Loop Re-spinning",
        "description": "Collect pre-consumer textile fabric cutting waste, shred into fiber and blend into secondary yarn for spinning line, avoiding virgin cotton cultivation footprint and landfilling.",
        "target_process": "Material Handling",
        "target_equipment": "Cutting Machine",
        "intervention_type": "recycled_material_input",
        "intervention_category": "circular_material_loop",
        "supported_sectors": ["Textile & Garment Dyeing"],
        "supported_processes": ["Material Handling", "Auxiliary Operations"],
        "supported_equipment": ["Cutting Machine"],
        "applicable_problem_types": ["material_yield_loss", "cutting_waste_accumulation", "scrap_generation_anomaly"],
        "objective_tags": ["circularity", "carbon", "payback"],
        "prerequisites": {
            "monthly_cutting_scrap_kg": 500.0,
            "scrap_sorting_bins_installed": True
        },
        "required_telemetry": ["scrap_rate_kg_hr"],
        "optional_telemetry": ["operating_hours"],
        "contraindications": [
            "Coated, elastane-heavy (>15%), or blended synthetic textiles that foul mechanical opening cylinders",
            "Lack of floor space for fiber baling and dust extraction"
        ],
        "implementation_constraints": [
            "Requires segregated scrap collection bins at cutting tables to prevent nylon/polyester cross-contamination"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "shredder_opener_inr": 550000.0,
                "dust_collection_inr": 120000.0,
                "baling_press_inr": 80000.0
            },
            "valid_ranges": {"shredder_opener_inr": [400000.0, 900000.0]},
            "valid_units": {"shredder_opener_inr": "INR"},
            "calculation_basis": "Capex = mechanical opener + dust collector + baler"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.06},
            "valid_ranges": {"maintenance_rate_pct": [0.03, 0.10]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * 0.06 (blade sharpening, power, filters)"
        },
        "savings_model": {
            "model_type": "material_substitution",
            "formula_version": "1.0.0",
            "input_variables": ["scrap_rate_kg_hr", "virgin_yarn_cost_per_kg"],
            "parameters": {
                "fiber_recovery_yield_pct": 0.85,
                "virgin_yarn_offset_ratio": 0.70
            },
            "valid_ranges": {"fiber_recovery_yield_pct": [0.75, 0.95]},
            "valid_units": {"scrap_rate_kg_hr": "kg/hr"},
            "calculation_basis": "Annual Savings = Annual Scrap Kg * yield * virgin_yarn_cost_per_kg * offset_ratio"
        },
        "carbon_reduction_model": {
            "model_type": "lifecycle_material_offset",
            "formula_version": "1.0.0",
            "parameters": {
                "embodied_carbon_virgin_cotton_kgco2_per_kg": 5.85,
                "processing_carbon_kgco2_per_kg": 0.45
            },
            "calculation_basis": "CO2 Abated = Recycled Fiber kg * (5.85 - 0.45 kgCO2e/kg)"
        },
        "waste_reduction_model": {
            "model_type": "landfill_diversion",
            "formula_version": "1.0.0",
            "parameters": {"diversion_pct": 0.90},
            "calculation_basis": "Diverts 90% of cutting floor fabric remnants from municipal industrial dump sites"
        },
        "revenue_model": {},
        "implementation_complexity": "Medium",
        "operational_disruption": "Low",
        "risk_level": "Medium",
        "feasibility": "Medium",
        "is_standard": True,
        "is_active": True,
        "reference_type": "UNIDO / Ellen MacArthur Foundation Circular Study",
        "reference_title": "Circular Economy in the Indian Textile Sector",
        "reference_organization": "UNIDO & Ministry of Textiles",
        "reference_url_or_document": "UNIDO Textile Circularity Roadmap (2023)",
        "reference_year": 2023,
        "reference_parameter": "Pre-consumer cutting scrap closed-loop utilization",
        "reference_parameter_range": "70% - 85% fiber loop recovery yield",
        "reference_applicability_notes": "Pre-consumer cotton scrap can be mechanically shredded and blended with 70% virgin cotton to produce coarse count yarn (10s-20s count) without tensile strength loss.",
        "requirements": "Sorting bins by fabric composition, rotary fiber opening/shredding unit.",
        "estimated_co2_reduction_annual_kg": 28000.0,
        "estimated_cost_inr": 750000.0,
        "annual_savings_inr": 340000.0,
        "payback_period_years": 2.21,
        "keywords": ["scrap", "fabric", "textile", "waste", "recycling", "cutting", "circular"]
    },
    {
        "id": "furnace_ceramic_insulation",
        "title": "High-Emissivity Ceramic Coating & Refractory Lining",
        "description": "Apply nano-ceramic high-emissivity coating on internal refractory walls of curing ovens and furnaces to reduce skin radiation losses and improve thermal uniformity by 12%.",
        "target_process": "Thermal Processing",
        "target_equipment": "Curing Oven",
        "intervention_type": "energy_efficiency",
        "intervention_category": "operational_optimization",
        "supported_sectors": ["Metals & Heavy Alloys", "Textile & Garment Dyeing", "General Manufacturing"],
        "supported_processes": ["Thermal Processing", "Heating & Combustion"],
        "supported_equipment": ["Curing Oven", "Furnace", "Boiler"],
        "applicable_problem_types": ["skin_temperature_radiation_loss", "thermal_efficiency_drop", "temperature_stratification"],
        "objective_tags": ["payback", "capex", "carbon"],
        "prerequisites": {
            "internal_operating_temp_c": 140.0,
            "refractory_substrate_sound": True
        },
        "required_telemetry": ["fuel_rate"],
        "optional_telemetry": ["energy_kwh", "skin_temperature_c"],
        "contraindications": [
            "Severe structural crumbling of refractory bricks requiring complete re-bricking first",
            "Operating temperatures exceeding 1300°C without zirconia-grade ceramic formulations"
        ],
        "implementation_constraints": [
            "Requires oven shutdown and cool-down window of 24-36 hours for surface grit blast and spray curing"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "ceramic_coating_material_inr": 110000.0,
                "surface_prep_application_inr": 50000.0
            },
            "valid_ranges": {"ceramic_coating_material_inr": [75000.0, 250000.0]},
            "valid_units": {"ceramic_coating_material_inr": "INR"},
            "calculation_basis": "Capex = high-emissivity coating materials + specialized spray application"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.03},
            "valid_ranges": {"maintenance_rate_pct": [0.01, 0.05]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * 0.03 (touch-up inspections)"
        },
        "savings_model": {
            "model_type": "percentage_fuel_reduction",
            "formula_version": "1.0.0",
            "input_variables": ["fuel_rate", "fuel_cost_per_unit"],
            "parameters": {
                "lower_bound_pct": 0.06,
                "expected_pct": 0.09,
                "upper_bound_pct": 0.13
            },
            "valid_ranges": {"expected_pct": [0.04, 0.16]},
            "valid_units": {"expected_pct": "fraction"},
            "calculation_basis": "Annual Savings = Annual Thermal Energy * thermal_radiation_reduction_pct * unit_cost"
        },
        "carbon_reduction_model": {
            "model_type": "emission_factor_multiplication",
            "formula_version": "1.0.0",
            "parameters": {"scope": "Scope 1"},
            "calculation_basis": "CO2 Abated = Annual Thermal Energy Saved * Emission Factor"
        },
        "waste_reduction_model": {},
        "revenue_model": {},
        "implementation_complexity": "Low",
        "operational_disruption": "Low",
        "risk_level": "Low",
        "feasibility": "High",
        "is_standard": True,
        "is_active": True,
        "reference_type": "Industrial Energy Audit Case Study",
        "reference_title": "Thermal Insulation and High Emissivity Coatings in Industrial Furnaces",
        "reference_organization": "Bureau of Energy Efficiency (BEE)",
        "reference_url_or_document": "BEE Sectoral Energy Efficiency Series: Industrial Furnaces (2021)",
        "reference_year": 2021,
        "reference_parameter": "Refractory skin heat loss abatement",
        "reference_parameter_range": "7% - 12% thermal energy savings in continuous curing ovens",
        "reference_applicability_notes": "Nano-ceramic coatings elevate interior wall emissivity from 0.45 to >0.92, reflecting radiant infrared energy back into the load rather than conducting through furnace walls.",
        "requirements": "Cleaned interior refractory surfaces, 24-hour curing downtime window.",
        "estimated_co2_reduction_annual_kg": 11500.0,
        "estimated_cost_inr": 160000.0,
        "annual_savings_inr": 95000.0,
        "payback_period_years": 1.68,
        "keywords": ["furnace", "oven", "curing", "refractory", "insulation", "radiation", "heat loss"]
    },
    {
        "id": "ie4_motor_retrofit",
        "title": "IE4 Super-Premium Efficiency Motor Replacement",
        "description": "Replace aging IE1/IE2 induction motors on continuous duty pumps and blowers with IE4 super-premium efficiency motors, lowering core electrical losses by 15%.",
        "target_process": "Fluid & Air Movement",
        "target_equipment": "Pump",
        "intervention_type": "equipment_optimization",
        "intervention_category": "equipment_upgrade",
        "supported_sectors": ["Textile & Garment Dyeing", "Metals & Heavy Alloys", "Chemical & Fertilizer Processing", "Food & Beverage Processing", "General Manufacturing"],
        "supported_processes": ["Fluid & Air Movement", "Auxiliary Operations", "Water Heating"],
        "supported_equipment": ["Pump", "Blower", "Compressor", "Fan"],
        "applicable_problem_types": ["motor_core_losses", "low_electrical_efficiency", "overheating_motor"],
        "objective_tags": ["payback", "carbon", "disruption"],
        "prerequisites": {
            "annual_operating_hours": 4000.0,
            "standard_iec_frame": True
        },
        "required_telemetry": ["energy_kwh"],
        "optional_telemetry": ["operating_hours"],
        "contraindications": [
            "Intermittent duty cycle (< 1500 hours per year) where capital recovery exceeds 5 years",
            "Special non-standard flange mounts requiring machine redesign"
        ],
        "implementation_constraints": [
            "Scheduled 4-hour replacement per motor during shift switchover"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "motor_hardware_inr": 150000.0,
                "mounting_coupling_inr": 15000.0,
                "labor_inr": 15000.0
            },
            "valid_ranges": {"motor_hardware_inr": [80000.0, 300000.0]},
            "valid_units": {"motor_hardware_inr": "INR"},
            "calculation_basis": "Capex = motor + couplings + installation"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.02},
            "valid_ranges": {"maintenance_rate_pct": [0.01, 0.04]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * 0.02"
        },
        "savings_model": {
            "model_type": "percentage_energy_reduction",
            "formula_version": "1.0.0",
            "input_variables": ["energy_kwh", "electricity_tariff_inr_kwh"],
            "parameters": {
                "lower_bound_pct": 0.05,
                "expected_pct": 0.075,
                "upper_bound_pct": 0.10
            },
            "valid_ranges": {"expected_pct": [0.04, 0.12]},
            "valid_units": {"expected_pct": "fraction"},
            "calculation_basis": "Annual Savings = Annual Pump kWh * tariff * efficiency_gain_pct"
        },
        "carbon_reduction_model": {
            "model_type": "emission_factor_multiplication",
            "formula_version": "1.0.0",
            "parameters": {"scope": "Scope 2"},
            "calculation_basis": "CO2 Abated = Annual kWh Saved * CEA Grid Emission Factor (0.716 kgCO2e/kWh)"
        },
        "waste_reduction_model": {},
        "revenue_model": {},
        "implementation_complexity": "Low",
        "operational_disruption": "Low",
        "risk_level": "Low",
        "feasibility": "High",
        "is_standard": True,
        "is_active": True,
        "reference_type": "Industrial Energy Audit Case Study",
        "reference_title": "Energy Efficient Motors Selection and Application",
        "reference_organization": "International Copper Association India / BEE",
        "reference_url_or_document": "BEE Guide on IE3/IE4 Energy Efficient Motors (2021)",
        "reference_year": 2021,
        "reference_parameter": "Motor electrical loss reduction percentage",
        "reference_parameter_range": "6% - 9% electrical energy reduction on continuous pump/blower duty",
        "reference_applicability_notes": "IE4 motors utilize high-grade magnetic laminations and copper rotor bars, reducing I^2*R stator and rotor thermal losses compared to legacy IE1 units.",
        "requirements": "Continuous operating hours (> 5000 hrs/year), standard frame size compatibility.",
        "estimated_co2_reduction_annual_kg": 8800.0,
        "estimated_cost_inr": 180000.0,
        "annual_savings_inr": 72000.0,
        "payback_period_years": 2.50,
        "keywords": ["motor", "pump", "blower", "ie4", "efficiency", "electricity"]
    },
    {
        "id": "hvac_chiller_optimization",
        "title": "Chiller Plant Automation & Condenser Water Reset",
        "description": "Install chilled water temperature reset controls and automatic tube brushing on shell-and-tube condensers to optimize chiller COP by 18%.",
        "target_process": "Cooling & HVAC",
        "target_equipment": "HVAC",
        "intervention_type": "equipment_optimization",
        "intervention_category": "process_control",
        "supported_sectors": ["Textile & Garment Dyeing", "Chemical & Fertilizer Processing", "Food & Beverage Processing", "General Manufacturing"],
        "supported_processes": ["Cooling & HVAC", "Auxiliary Operations"],
        "supported_equipment": ["HVAC", "Chiller", "Cooling Tower"],
        "applicable_problem_types": ["chiller_low_cop", "condenser_fouling", "excess_chiller_power"],
        "objective_tags": ["payback", "carbon", "disruption"],
        "prerequisites": {
            "chiller_capacity_tr": 50.0,
            "water_cooled_condenser": True
        },
        "required_telemetry": ["energy_kwh"],
        "optional_telemetry": ["temperature_c"],
        "contraindications": [
            "Air-cooled unitary package units without chilled water loops",
            "Severe bio-fouling or scaled tubes requiring chemical descaling prior to automation"
        ],
        "implementation_constraints": [
            "Sensor installation in chilled water headers during seasonal low-cooling weekend"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "chiller_plc_inr": 190000.0,
                "transducers_valves_inr": 60000.0,
                "commissioning_inr": 40000.0
            },
            "valid_ranges": {"chiller_plc_inr": [150000.0, 450000.0]},
            "valid_units": {"chiller_plc_inr": "INR"},
            "calculation_basis": "Capex = controller + precision transducers + commissioning"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.04},
            "valid_ranges": {"maintenance_rate_pct": [0.02, 0.08]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * 0.04"
        },
        "savings_model": {
            "model_type": "percentage_energy_reduction",
            "formula_version": "1.0.0",
            "input_variables": ["energy_kwh", "electricity_tariff_inr_kwh"],
            "parameters": {
                "lower_bound_pct": 0.12,
                "expected_pct": 0.17,
                "upper_bound_pct": 0.22
            },
            "valid_ranges": {"expected_pct": [0.10, 0.25]},
            "valid_units": {"expected_pct": "fraction"},
            "calculation_basis": "Annual Savings = Annual HVAC kWh * tariff * cop_improvement_pct"
        },
        "carbon_reduction_model": {
            "model_type": "emission_factor_multiplication",
            "formula_version": "1.0.0",
            "parameters": {"scope": "Scope 2"},
            "calculation_basis": "CO2 Abated = Annual kWh Saved * CEA Grid Emission Factor (0.716 kgCO2e/kWh)"
        },
        "waste_reduction_model": {},
        "revenue_model": {},
        "implementation_complexity": "Medium",
        "operational_disruption": "Low",
        "risk_level": "Low",
        "feasibility": "High",
        "is_standard": True,
        "is_active": True,
        "reference_type": "Industrial Energy Audit Case Study",
        "reference_title": "HVAC and Chiller Plant Performance Optimization",
        "reference_organization": "Bureau of Energy Efficiency (BEE)",
        "reference_url_or_document": "BEE HVAC Optimization Manual (2020)",
        "reference_year": 2020,
        "reference_parameter": "Chiller COP improvement through condenser reset",
        "reference_parameter_range": "14% - 20% electrical energy savings",
        "reference_applicability_notes": "Resetting chilled water temperature upward by 1°C during partial ambient load conditions yields ~3% compressor electrical energy savings.",
        "requirements": "Central chilled water system, digital temperature transmitter ports.",
        "estimated_co2_reduction_annual_kg": 13200.0,
        "estimated_cost_inr": 290000.0,
        "annual_savings_inr": 140000.0,
        "payback_period_years": 2.07,
        "keywords": ["hvac", "chiller", "cooling", "cop", "condenser", "ventilation"]
    },
    {
        "id": "fuel_switch_biomass_briquettes",
        "title": "Fuel Switching: Coal to Agro-Residue Biomass Briquettes",
        "description": "Convert coal-fired furnace/boiler burner grates to fire agricultural biomass briquettes (mustard husk / groundnut shell), dramatically abating fossil carbon emissions.",
        "target_process": "Heating & Combustion",
        "target_equipment": "Furnace",
        "intervention_type": "fuel_switching",
        "intervention_category": "fuel_switching",
        "supported_sectors": ["Metals & Heavy Alloys", "Textile & Garment Dyeing", "Chemical & Fertilizer Processing"],
        "supported_processes": ["Heating & Combustion", "Steam Generation", "Thermal Processing"],
        "supported_equipment": ["Furnace", "Boiler"],
        "applicable_problem_types": ["excess_fossil_fuel_intensity", "combustion_emissions", "thermal_efficiency_drop"],
        "objective_tags": ["carbon", "circularity"],
        "prerequisites": {
            "grate_firing_mechanism_compatible": True,
            "dry_biomass_storage_area_sqm": 100.0
        },
        "required_telemetry": ["fuel_rate"],
        "optional_telemetry": ["operating_hours"],
        "contraindications": [
            "Cyclone or pulverized coal burners without reciprocating grate capability",
            "Areas lacking regional biomass briquette supply chain within 100 km radius"
        ],
        "implementation_constraints": [
            "Requires grate bar spacing modification and particulate baghouse filter upgrade (7-day shutdown)"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "grate_feeder_modification_inr": 280000.0,
                "ash_handling_bagfilter_inr": 200000.0
            },
            "valid_ranges": {"grate_feeder_modification_inr": [200000.0, 600000.0]},
            "valid_units": {"grate_feeder_modification_inr": "INR"},
            "calculation_basis": "Capex = feeder modification + ash handling system"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.05},
            "valid_ranges": {"maintenance_rate_pct": [0.03, 0.08]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * 0.05"
        },
        "savings_model": {
            "model_type": "fuel_cost_differential",
            "formula_version": "1.0.0",
            "input_variables": ["fuel_rate", "coal_cost_per_kg", "biomass_cost_per_kg"],
            "parameters": {
                "calorific_ratio_coal_to_biomass": 1.15,
                "expected_fuel_cost_savings_pct": 0.12
            },
            "valid_ranges": {"expected_fuel_cost_savings_pct": [0.05, 0.20]},
            "valid_units": {"fuel_rate": "kg/hr"},
            "calculation_basis": "Annual Savings = Annual Energy Demand * (Coal Cost/GJ - Biomass Cost/GJ)"
        },
        "carbon_reduction_model": {
            "model_type": "fuel_switching_emission_offset",
            "formula_version": "1.0.0",
            "parameters": {
                "coal_ef_kgco2_per_kg": 2.42,
                "biomass_ef_kgco2_per_kg": 0.035
            },
            "calculation_basis": "CO2 Abated = Annual Fuel Kg * (2.42 - 0.035 kgCO2e/kg)"
        },
        "waste_reduction_model": {},
        "revenue_model": {},
        "implementation_complexity": "High",
        "operational_disruption": "High",
        "risk_level": "Medium",
        "feasibility": "Medium",
        "is_standard": True,
        "is_active": True,
        "reference_type": "Industrial Energy Audit Case Study",
        "reference_title": "Agro-Residue Biomass Co-firing and Fuel Switching in Boilers & Furnaces",
        "reference_organization": "Bureau of Energy Efficiency (BEE) / MNRE",
        "reference_url_or_document": "BEE Biomass Fuel Switching Assessment Protocol (2022)",
        "reference_year": 2022,
        "reference_parameter": "Net GHG abatement through agro-residue biomass substitution",
        "reference_parameter_range": "80% - 95% net Scope 1 GHG abatement",
        "reference_applicability_notes": "Agricultural briquettes from mustard crop residue have gross calorific values of ~3800-4200 kcal/kg, directly substituting Indian grade D/E coal.",
        "requirements": "Grate modification, local agro-biomass supply chain contract, particulate filtration.",
        "estimated_co2_reduction_annual_kg": 42000.0,
        "estimated_cost_inr": 480000.0,
        "annual_savings_inr": 210000.0,
        "payback_period_years": 2.29,
        "keywords": ["coal", "furnace", "boiler", "biomass", "briquettes", "fuel", "combustion"]
    },
    {
        "id": "industrial_heat_pump",
        "title": "Industrial High-Temperature Heat Pump for Process Water",
        "description": "Install an electric heat pump (COP 3.5) utilizing cooling tower waste heat to generate 75°C hot water for washing/dyeing, replacing fossil fuel burning.",
        "target_process": "Water Heating",
        "target_equipment": "Water Heater",
        "intervention_type": "waste_heat_recovery",
        "intervention_category": "heat_recovery",
        "supported_sectors": ["Textile & Garment Dyeing", "Food & Beverage Processing", "Chemical & Fertilizer Processing"],
        "supported_processes": ["Water Heating", "Steam Generation", "Cooling & HVAC"],
        "supported_equipment": ["Water Heater", "Boiler", "Cooling Tower"],
        "applicable_problem_types": ["thermal_efficiency_drop", "cooling_tower_heat_loss", "fuel_overconsumption"],
        "objective_tags": ["carbon", "circularity", "payback"],
        "prerequisites": {
            "low_grade_heat_source_temp_c": 30.0,
            "max_hot_water_delivery_temp_c": 80.0
        },
        "required_telemetry": ["fuel_rate", "energy_kwh"],
        "optional_telemetry": ["temperature_c"],
        "contraindications": [
            "High temperature steam requirements (> 100°C) exceeding current industrial refrigerant limits",
            "Unstable electrical grid prone to persistent phase unbalance"
        ],
        "implementation_constraints": [
            "Hydraulic connection between cooling tower basin and hot water storage tank"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "heat_pump_skid_inr": 950000.0,
                "heat_exchangers_pumps_inr": 150000.0,
                "electrical_piping_inr": 100000.0
            },
            "valid_ranges": {"heat_pump_skid_inr": [700000.0, 1600000.0]},
            "valid_units": {"heat_pump_skid_inr": "INR"},
            "calculation_basis": "Capex = heat pump skid + secondary heat exchangers + installation"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.03},
            "valid_ranges": {"maintenance_rate_pct": [0.02, 0.05]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * 0.03"
        },
        "savings_model": {
            "model_type": "fuel_to_electric_displacement",
            "formula_version": "1.0.0",
            "input_variables": ["fuel_rate", "fuel_cost_per_unit", "electricity_tariff_inr_kwh"],
            "parameters": {
                "cop_heat_pump": 3.5,
                "net_energy_cost_savings_pct": 0.28
            },
            "valid_ranges": {"cop_heat_pump": [2.8, 4.5]},
            "valid_units": {"cop_heat_pump": "ratio"},
            "calculation_basis": "Annual Savings = Displaced Fossil Fuel Cost - Heat Pump Electricity Cost"
        },
        "carbon_reduction_model": {
            "model_type": "electrification_offset",
            "formula_version": "1.0.0",
            "parameters": {"fossil_scope1_displaced": True},
            "calculation_basis": "CO2 Abated = Displaced Fossil Fuel CO2 - Heat Pump Grid CO2"
        },
        "waste_reduction_model": {},
        "revenue_model": {},
        "implementation_complexity": "High",
        "operational_disruption": "Medium",
        "risk_level": "Medium",
        "feasibility": "Medium",
        "is_standard": True,
        "is_active": True,
        "reference_type": "UNIDO Industrial Decarbonization Study",
        "reference_title": "Electrification of Industrial Process Heat through High-Temperature Heat Pumps",
        "reference_organization": "UNIDO / International Energy Agency (IEA)",
        "reference_url_or_document": "IEA Industrial Heat Pumps Technology Roadmap (2022)",
        "reference_year": 2022,
        "reference_parameter": "Coefficient of Performance (COP) and fossil fuel displacement",
        "reference_parameter_range": "COP 3.2 - 4.0 for process water heating up to 80°C",
        "reference_applicability_notes": "Heat pumps upgrade low-temperature waste heat from effluent streams or chiller condensors into usable 75°C process hot water with 65-75% primary energy savings.",
        "requirements": "Low-grade waste heat source (30-40°C), three-phase electricity supply.",
        "estimated_co2_reduction_annual_kg": 34000.0,
        "estimated_cost_inr": 1200000.0,
        "annual_savings_inr": 420000.0,
        "payback_period_years": 2.86,
        "keywords": ["heat pump", "hot water", "cop", "heater", "low carbon", "electrification"]
    },
    {
        "id": "rooftop_solar_pv",
        "title": "Captive On-Grid Rooftop Solar PV System (50 kWp)",
        "description": "Install high-efficiency monocrystalline solar panels on factory shed roofs to generate clean electricity during peak daytime production hours, directly offsetting grid power.",
        "target_process": "Power Supply",
        "target_equipment": "Grid Power",
        "intervention_type": "solar_integration",
        "intervention_category": "renewable_energy",
        "supported_sectors": ["Textile & Garment Dyeing", "Metals & Heavy Alloys", "Chemical & Fertilizer Processing", "Food & Beverage Processing", "General Manufacturing"],
        "supported_processes": ["Power Supply", "Auxiliary Operations"],
        "supported_equipment": ["Grid Power", "Transformer"],
        "applicable_problem_types": ["high_grid_emissions", "peak_tariff_demand", "high_scope_2_intensity"],
        "objective_tags": ["carbon", "payback"],
        "prerequisites": {
            "shadow_free_roof_sqm": 450.0,
            "structural_roof_integrity_verified": True
        },
        "required_telemetry": ["energy_kwh"],
        "optional_telemetry": [],
        "contraindications": [
            "Asbestos or dilapidated roof sheets unable to bear 15 kg/sq.m static dead load",
            "Severe shadow obstruction from neighboring multi-story industrial buildings"
        ],
        "implementation_constraints": [
            "Requires DISCOM net-metering synchronization and grid CEIG safety inspection"
        ],
        "capex_model": {
            "model_type": "linear_power_capacity",
            "formula_version": "1.0.0",
            "parameters": {
                "capacity_kwp": 50.0,
                "cost_per_kwp_inr": 42000.0
            },
            "valid_ranges": {"cost_per_kwp_inr": [35000.0, 55000.0]},
            "valid_units": {"capacity_kwp": "kWp", "cost_per_kwp_inr": "INR/kWp"},
            "calculation_basis": "Capex = capacity_kwp * cost_per_kwp_inr"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.015},
            "valid_ranges": {"maintenance_rate_pct": [0.01, 0.03]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * 0.015 (cleaning, module checks, inverter AMC)"
        },
        "savings_model": {
            "model_type": "solar_generation_offset",
            "formula_version": "1.0.0",
            "input_variables": ["electricity_tariff_inr_kwh"],
            "parameters": {
                "annual_generation_kwh_per_kwp": 1450.0,
                "system_capacity_kwp": 50.0
            },
            "valid_ranges": {"annual_generation_kwh_per_kwp": [1300.0, 1650.0]},
            "valid_units": {"annual_generation_kwh_per_kwp": "kWh/kWp/yr"},
            "calculation_basis": "Annual Savings = capacity_kwp * generation_per_kwp * electricity_tariff"
        },
        "carbon_reduction_model": {
            "model_type": "emission_factor_multiplication",
            "formula_version": "1.0.0",
            "parameters": {"scope": "Scope 2"},
            "calculation_basis": "CO2 Abated = Annual Solar Generation kWh * CEA Grid Emission Factor (0.716 kgCO2e/kWh)"
        },
        "waste_reduction_model": {},
        "revenue_model": {},
        "implementation_complexity": "Medium",
        "operational_disruption": "Low",
        "risk_level": "Low",
        "feasibility": "High",
        "is_standard": True,
        "is_active": True,
        "reference_type": "Government Renewable Benchmark",
        "reference_title": "Benchmark Costs for Grid-Connected Rooftop Solar PV Systems",
        "reference_organization": "Ministry of New and Renewable Energy (MNRE)",
        "reference_url_or_document": "MNRE Rooftop Solar Technical Specifications (2023)",
        "reference_year": 2023,
        "reference_parameter": "Specific annual generation yield",
        "reference_parameter_range": "1400 - 1550 kWh/kWp/year in Western India climate zones",
        "reference_applicability_notes": "Tier 1 monocrystalline PERC solar panels achieve 21%+ conversion efficiency with 25-year linear performance warranty.",
        "requirements": "Minimum 500 sq.m shadow-free factory shed roof, net metering permission from DISCOM.",
        "estimated_co2_reduction_annual_kg": 52000.0,
        "estimated_cost_inr": 2100000.0,
        "annual_savings_inr": 580000.0,
        "payback_period_years": 3.62,
        "keywords": ["solar", "rooftop", "pv", "electricity", "grid", "power", "renewable"]
    },
    {
        "id": "boiler_standby_setback",
        "title": "Automated Boiler Standby Setback & Off-Hours Cutoff Controller",
        "description": "Install an automated digital setback controller with motorized fuel and steam isolation valves to automatically ramp down boiler firing to low-fire holding or safe off-state during scheduled off-hours or non-production shifts. Eliminates 70-85% of idle standby fuel and auxiliary power waste.",
        "target_process": "Steam Generation",
        "target_equipment": "Boiler",
        "intervention_type": "energy_efficiency",
        "intervention_category": "process_control",
        "supported_sectors": ["Textile & Garment Dyeing", "Metals & Heavy Alloys", "Chemical & Fertilizer Processing", "Food & Beverage Processing", "General Manufacturing"],
        "supported_processes": ["Steam Generation", "Steam Generation Utility", "Thermal Processing", "Water Heating", "Auxiliary Operations"],
        "supported_equipment": ["Boiler", "Steam Generator", "Industrial Steam Boiler (Dual Fuel)", "Furnace", "Thermal Fluid Heater"],
        "applicable_problem_types": ["standby_idle_energy_loss", "off_hours_idle_waste", "unloaded_idle_runtime", "excess_fuel_consumption", "abnormal_idle_power", "operational_shift_leak"],
        "objective_tags": ["payback", "capex", "disruption", "carbon"],
        "prerequisites": {
            "min_off_hours_per_week": 16.0,
            "programmable_burner_management": True
        },
        "required_telemetry": ["energy_kwh"],
        "optional_telemetry": ["fuel_rate", "operating_hours"],
        "contraindications": [
            "Continuous 24x7 base-load production without shift breaks",
            "Emergency steam backup systems requiring instantaneous full-pressure firing"
        ],
        "implementation_constraints": [
            "Requires burner management system (BMS) interlock integration; scheduled weekend installation (4-6 hours)"
        ],
        "capex_model": {
            "model_type": "fixed_cost_bracket",
            "formula_version": "1.0.0",
            "parameters": {
                "setback_controller_inr": 35000.0,
                "solenoid_valves_labor_inr": 20000.0
            },
            "valid_ranges": {"setback_controller_inr": [25000.0, 60000.0]},
            "valid_units": {"setback_controller_inr": "INR"},
            "calculation_basis": "Capex = setback_controller + motorized_valves_and_labor"
        },
        "opex_model": {
            "model_type": "annual_maintenance_pct",
            "formula_version": "1.0.0",
            "parameters": {"maintenance_rate_pct": 0.05},
            "valid_ranges": {"maintenance_rate_pct": [0.02, 0.10]},
            "valid_units": {"maintenance_rate_pct": "fraction"},
            "calculation_basis": "Annual Opex = Capex * 0.05"
        },
        "savings_model": {
            "model_type": "percentage_energy_reduction",
            "formula_version": "1.0.0",
            "input_variables": ["energy_kwh", "electricity_tariff_inr_kwh"],
            "parameters": {
                "lower_bound_pct": 0.15,
                "expected_pct": 0.22,
                "upper_bound_pct": 0.28
            },
            "valid_ranges": {"expected_pct": [0.10, 0.35]},
            "valid_units": {"expected_pct": "fraction", "energy_kwh": "kWh"},
            "calculation_basis": "Annual Savings = Annual Idle Excess Energy * active_tariff * savings_pct"
        },
        "carbon_reduction_model": {
            "model_type": "emission_factor_multiplication",
            "formula_version": "1.0.0",
            "parameters": {"scope": "Scope 2"},
            "calculation_basis": "CO2 Abated = Annual kWh Saved * CEA Grid Emission Factor (0.716 kgCO2e/kWh)"
        },
        "waste_reduction_model": {},
        "revenue_model": {},
        "implementation_complexity": "Low",
        "operational_disruption": "Low",
        "risk_level": "Low",
        "feasibility": "High",
        "is_standard": True,
        "is_active": True,
        "reference_type": "Industrial Energy Audit Case Study",
        "reference_title": "Best Operating Practices in Steam Boiler Standby & Load Modulation",
        "reference_organization": "Bureau of Energy Efficiency (BEE)",
        "reference_url_or_document": "BEE Guide Book 2 - Thermal Utilities (Boilers & Steam Systems)",
        "reference_year": 2023,
        "reference_parameter": "Boiler off-hours setback & idle fuel elimination",
        "reference_parameter_range": "15% - 25% standby energy reduction",
        "reference_applicability_notes": "Eliminates parasitic standby radiation and convection losses during non-productive factory shifts.",
        "requirements": "Digital setback timer or PLC, motorized fuel shutoff valve.",
        "estimated_co2_reduction_annual_kg": 12500.0,
        "estimated_cost_inr": 55000.0,
        "annual_savings_inr": 95000.0,
        "payback_period_years": 0.58,
        "keywords": ["boiler", "standby", "idle", "setback", "shutoff", "timer", "steam"]
    }
]
