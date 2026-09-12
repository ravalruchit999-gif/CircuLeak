import csv
import datetime
import random

# Generate realistic 7-day hourly industrial data for a textile manufacturing facility
start_date = datetime.date(2026, 8, 1)

equipment_specs = [
    {
        "equipment": "Compressor 03 (Screw)",
        "process": "Compressed Air",
        "base_elec": 32.0,
        "fuel_type": "none",
        "base_fuel": 0.0,
        "active_hours": range(6, 22),
        "has_leak": True  # Night-time leak: runs continuously 22:00 - 05:00 at ~24-28 kWh
    },
    {
        "equipment": "Boiler 02 (Steam)",
        "process": "Steam Generation",
        "base_elec": 12.0,
        "fuel_type": "natural_gas",
        "base_fuel": 45.0,  # m3/hr
        "active_hours": range(6, 22),
        "has_leak": False
    },
    {
        "equipment": "Stenter Frame Oven",
        "process": "Thermal Processing",
        "base_elec": 45.0,
        "fuel_type": "natural_gas",
        "base_fuel": 30.0,
        "active_hours": range(7, 21),
        "has_leak": False
    },
    {
        "equipment": "Primary Chiller Unit",
        "process": "Cooling & HVAC",
        "base_elec": 28.0,
        "fuel_type": "none",
        "base_fuel": 0.0,
        "active_hours": range(6, 23),
        "has_leak": False
    }
]

rows = []
for day_offset in range(7):
    current_date = start_date + datetime.timedelta(days=day_offset)
    date_str = current_date.strftime("%Y-%m-%d")
    is_weekend = current_date.weekday() >= 5

    for hour in range(24):
        for eq in equipment_specs:
            is_active_shift = (hour in eq["active_hours"]) and not is_weekend

            if is_active_shift:
                production_vol = round(random.uniform(75.0, 110.0), 1)
                elec_kwh = round(eq["base_elec"] * random.uniform(0.92, 1.12), 2)
                fuel_qty = round(eq["base_fuel"] * random.uniform(0.90, 1.15), 2) if eq["fuel_type"] != "none" else 0.0
                operating_hrs = 1.0

                # Inject severe efficiency drop on day 5 for Boiler
                if eq["equipment"] == "Boiler 02 (Steam)" and day_offset == 5 and 10 <= hour <= 14:
                    fuel_qty = round(fuel_qty * 1.65, 2)  # 65% spike in fuel consumption
            else:
                # Off-hours or weekend
                production_vol = 0.0
                operating_hrs = 0.0

                if eq["has_leak"] and eq["equipment"] == "Compressor 03 (Screw)":
                    # Severe behavioral leak: compressor cycling unmetered during off hours
                    elec_kwh = round(random.uniform(23.0, 27.5), 2)
                    fuel_qty = 0.0
                else:
                    # Normal standby / phantom power
                    elec_kwh = round(random.uniform(0.5, 2.0), 2)
                    fuel_qty = 0.0

            rows.append({
                "date": date_str,
                "hour": hour,
                "equipment": eq["equipment"],
                "process": eq["process"],
                "electricity_kwh": elec_kwh,
                "fuel_type": eq["fuel_type"],
                "fuel_quantity": fuel_qty,
                "production_volume": production_vol,
                "operating_hours": operating_hrs
            })

with open("d:/CircuLeak/CircuLeak/backend/app/data/demo_industrial_data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=[
        "date", "hour", "equipment", "process", "electricity_kwh",
        "fuel_type", "fuel_quantity", "production_volume", "operating_hours"
    ])
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {len(rows)} rows of realistic industrial telemetry.")
