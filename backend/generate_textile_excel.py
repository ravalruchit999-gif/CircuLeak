import datetime
import random
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Set fixed seed for repeatable, consistent industrial simulation
random.seed(42)

def generate_textile_telemetry():
    # 14 Full Days: August 28, 2026 to September 10, 2026
    start_date = datetime.date(2026, 8, 28)
    total_days = 14
    
    # Industrial equipment definitions for Textile & Garment Dyeing Facility (RK Industries)
    equipment_catalog = [
        {
            "equipment": "HTHP Jet Dyeing Machine #01",
            "process": "Dyeing & Bleaching",
            "base_elec": 35.0,
            "elec_sd": 2.5,
            "fuel_type": "none",
            "base_fuel": 0.0,
            "fuel_sd": 0.0,
            "base_prod_kg": 420.0,
            "base_temp_c": 130.0,
            "base_press_bar": 3.5,
            "continuous_247": False,
            "weekend_run": True, # Runs Saturday, light Sunday
        },
        {
            "equipment": "Soft Flow Jet Dyeing Machine #02",
            "process": "Dyeing & Bleaching",
            "base_elec": 28.0,
            "elec_sd": 2.0,
            "fuel_type": "none",
            "base_fuel": 0.0,
            "fuel_sd": 0.0,
            "base_prod_kg": 340.0,
            "base_temp_c": 98.0,
            "base_press_bar": 1.2,
            "continuous_247": False,
            "weekend_run": False,
        },
        {
            "equipment": "8-Chamber Stenter Frame",
            "process": "Finishing & Heat Setting",
            "base_elec": 74.0,
            "elec_sd": 4.0,
            "fuel_type": "natural_gas",
            "base_fuel": 38.0,  # m3/hr PNG
            "fuel_sd": 3.0,
            "base_prod_kg": 750.0,
            "base_temp_c": 185.0,
            "base_press_bar": 1.0,
            "continuous_247": False,
            "weekend_run": True,
        },
        {
            "equipment": "Rotary Screen Printing Machine",
            "process": "Printing & Curing",
            "base_elec": 38.0,
            "elec_sd": 2.5,
            "fuel_type": "none",
            "base_fuel": 0.0,
            "fuel_sd": 0.0,
            "base_prod_kg": 480.0,
            "base_temp_c": 150.0,
            "base_press_bar": 2.0,
            "continuous_247": False,
            "weekend_run": False,
        },
        {
            "equipment": "Industrial Steam Boiler (Dual Fuel)",
            "process": "Steam Generation Utility",
            "base_elec": 20.0,
            "elec_sd": 1.8,
            "fuel_type": "natural_gas",
            "base_fuel": 165.0,  # m3/hr PNG
            "fuel_sd": 12.0,
            "base_prod_kg": 0.0, # Utility
            "base_temp_c": 170.0,
            "base_press_bar": 8.0,
            "continuous_247": True, # Runs 24/7 maintaining head
            "weekend_run": True,
        },
        {
            "equipment": "Screw Air Compressor GA-75",
            "process": "Compressed Air Utility",
            "base_elec": 58.0,
            "elec_sd": 3.5,
            "fuel_type": "none",
            "base_fuel": 0.0,
            "fuel_sd": 0.0,
            "base_prod_kg": 0.0, # Utility
            "base_temp_c": 45.0,
            "base_press_bar": 7.0,
            "continuous_247": False,
            "weekend_run": False,
        },
        {
            "equipment": "ETP Aeration Blower Station",
            "process": "Wastewater & ETP Utility",
            "base_elec": 44.0,
            "elec_sd": 1.5,
            "fuel_type": "none",
            "base_fuel": 0.0,
            "fuel_sd": 0.0,
            "base_prod_kg": 0.0, # Utility
            "base_temp_c": 32.0,
            "base_press_bar": 0.6,
            "continuous_247": True, # Continuous biological wastewater aeration
            "weekend_run": True,
        }
    ]

    records = []

    for day_idx in range(total_days):
        current_date = start_date + datetime.timedelta(days=day_idx)
        date_str = current_date.strftime("%Y-%m-%d")
        weekday = current_date.weekday() # 0=Mon, 5=Sat, 6=Sun
        is_sunday = (weekday == 6)
        is_saturday = (weekday == 5)

        for hour in range(24):
            dt_obj = datetime.datetime.combine(current_date, datetime.time(hour, 0, 0))
            timestamp_str = dt_obj.strftime("%Y-%m-%d %H:%M:%S")

            # Determine factory shift
            if 6 <= hour < 14:
                shift_name = "Shift A (Morning)"
            elif 14 <= hour < 22:
                shift_name = "Shift B (Evening)"
            else:
                shift_name = "Shift C (Night)"

            for asset in equipment_catalog:
                eq_name = asset["equipment"]
                process_name = asset["process"]
                fuel_type = asset["fuel_type"]

                # Production status logic:
                # ETP & Boiler run 24/7
                # Stenter & Jet 01 run Shifts A, B & partial C
                # Printing & Jet 02 run Shifts A & B (06:00 to 22:00)
                # Sundays: main production down, maintenance
                is_active = False
                if asset["continuous_247"]:
                    is_active = True
                elif is_sunday:
                    is_active = False
                elif is_saturday:
                    is_active = (6 <= hour < 18) and asset["weekend_run"]
                else:
                    if eq_name in ["Rotary Screen Printing Machine", "Soft Flow Jet Dyeing Machine #02"]:
                        is_active = (6 <= hour < 22)
                    elif eq_name in ["HTHP Jet Dyeing Machine #01", "8-Chamber Stenter Frame"]:
                        is_active = (6 <= hour <= 23)
                    elif eq_name == "Screw Air Compressor GA-75":
                        is_active = (5 <= hour <= 23)

                if is_active:
                    # Batch fluctuation factor (0.95 to 1.05)
                    fluct = random.uniform(0.96, 1.04)
                    elec_kwh = round(asset["base_elec"] * fluct, 2)
                    fuel_qty = round(asset["base_fuel"] * fluct, 2) if fuel_type != "none" else 0.0
                    prod_vol = round(asset["base_prod_kg"] * fluct, 1) if asset["base_prod_kg"] > 0 else 0.0
                    oper_hours = 1.0
                    temp_c = round(asset["base_temp_c"] * random.uniform(0.98, 1.02), 1)
                    press_bar = round(asset["base_press_bar"] * random.uniform(0.97, 1.03), 2)
                else:
                    # Machine is idle or off
                    oper_hours = 0.0
                    prod_vol = 0.0
                    
                    if eq_name == "Screw Air Compressor GA-75":
                        # Persistent factory airline distribution leak:
                        # Compressor cycles unloaded/loaded during night & weekend off-hours drawing 24-27 kWh
                        elec_kwh = round(random.uniform(23.5, 27.2), 2)
                        fuel_qty = 0.0
                        temp_c = 38.5
                        press_bar = round(random.uniform(5.8, 6.4), 2)
                    elif asset["continuous_247"] and is_sunday:
                        # Boiler on Sunday runs low baseline idle steam
                        if eq_name == "Industrial Steam Boiler (Dual Fuel)":
                            elec_kwh = round(asset["base_elec"] * 0.40, 2)
                            fuel_qty = round(asset["base_fuel"] * 0.30, 2)
                            temp_c = 135.0
                            press_bar = 4.8
                        else:
                            elec_kwh = round(asset["base_elec"] * 0.90, 2)
                            fuel_qty = 0.0
                            temp_c = 30.0
                            press_bar = 0.5
                    elif asset["continuous_247"]:
                        # 24/7 continuous operations (ETP Blower)
                        elec_kwh = round(asset["base_elec"] * random.uniform(0.97, 1.03), 2)
                        fuel_qty = 0.0
                        temp_c = 32.0
                        press_bar = 0.6
                    else:
                        elec_kwh = round(random.uniform(0.6, 1.8), 2) # Control panel standby
                        fuel_qty = 0.0
                        temp_c = round(random.uniform(28.0, 32.0), 1)
                        press_bar = 0.0

                # =========================================================
                # REALISTIC INDUSTRIAL ANOMALY / CARBON LEAK INJECTIONS
                # =========================================================

                # ANOMALY 1: HTHP Jet Dyeing Circulation Pump Cavitation / Clogging
                # Date: Wednesday & Thursday, Sept 2 & 3 (day_idx = 5 & 6)
                # Impeller cavitation and heat exchanger scaling causes 48% electricity spike
                if eq_name == "HTHP Jet Dyeing Machine #01" and day_idx in [5, 6] and is_active:
                    elec_kwh = round(elec_kwh * 1.52, 2)
                    prod_vol = round(prod_vol * 0.88, 1) # Output reduced due to liquor flow restriction
                    press_bar = round(press_bar * 1.15, 2)

                # ANOMALY 2: 8-Chamber Stenter Frame Exhaust Damper Actuator Failure & Blower Overload
                # Date: Friday & Saturday, Sept 4 & 5 (day_idx = 7 & 8)
                # Damper stuck open, exhaust blowers running maximum CFM + burners compensating
                if eq_name == "8-Chamber Stenter Frame" and day_idx in [7, 8] and is_active:
                    elec_kwh = round(elec_kwh * 1.34, 2) # Blowers fighting negative pressure (98-102 kWh)
                    fuel_qty = round(fuel_qty * 1.58, 2) # 58-65 m3/hr thermal PNG loss
                    temp_c = round(temp_c * 0.95, 1) # Burners struggling to maintain setpoint

                # ANOMALY 3: Industrial Boiler Blowdown Valve Leak
                # Date: Tuesday Sept 8 (day_idx = 11) between 08:00 and 18:00
                # Valve failed partially open, constant live steam blowdown loss
                if eq_name == "Industrial Steam Boiler (Dual Fuel)" and day_idx == 11 and (8 <= hour <= 18):
                    fuel_qty = round(fuel_qty * 1.40, 2)
                    elec_kwh = round(elec_kwh * 1.22, 2) # Feedwater pump running extra cycles

                records.append({
                    "timestamp": timestamp_str,
                    "equipment": eq_name,
                    "process": process_name,
                    "electricity_kwh": elec_kwh,
                    "fuel_type": fuel_type,
                    "fuel_quantity": fuel_qty,
                    "production_volume": prod_vol,
                    "operating_hours": oper_hours,
                    "shift": shift_name,
                    "temperature": temp_c,
                    "pressure": press_bar
                })

    return records

def build_excel_workbook(records, output_path):
    wb = openpyxl.Workbook()
    
    # Sheet 1: Telemetry Data
    ws_data = wb.active
    ws_data.title = "Textile_Telemetry_Data"
    ws_data.views.sheetView[0].showGridLines = True

    # Styling Palettes (Industrial Slate / Navy Theme)
    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid") # Slate 800
    header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    data_font = Font(name="Segoe UI", size=10, color="0F172A")
    border_thin = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )
    zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

    headers = [
        "timestamp",
        "equipment",
        "process",
        "electricity_kwh",
        "fuel_type",
        "fuel_quantity",
        "production_volume",
        "operating_hours",
        "shift",
        "temperature",
        "pressure"
    ]

    # Write headers
    for col_idx, h in enumerate(headers, 1):
        cell = ws_data.cell(row=1, column=col_idx, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_thin

    ws_data.row_dimensions[1].height = 28

    # Write records
    for row_idx, r in enumerate(records, 2):
        row_values = [
            r["timestamp"],
            r["equipment"],
            r["process"],
            r["electricity_kwh"],
            r["fuel_type"],
            r["fuel_quantity"],
            r["production_volume"],
            r["operating_hours"],
            r["shift"],
            r["temperature"],
            r["pressure"]
        ]
        is_zebra = (row_idx % 2 == 0)
        for col_idx, val in enumerate(row_values, 1):
            cell = ws_data.cell(row=row_idx, column=col_idx, value=val)
            cell.font = data_font
            cell.border = border_thin
            if is_zebra:
                cell.fill = zebra_fill
            
            # Alignments & Formats
            if col_idx == 1:
                cell.alignment = Alignment(horizontal="center")
            elif col_idx in [2, 3, 5, 9]:
                cell.alignment = Alignment(horizontal="left")
            else:
                cell.alignment = Alignment(horizontal="right")
                if col_idx in [4, 6, 7, 10, 11]:
                    cell.number_format = "#,##0.00"
                elif col_idx == 8:
                    cell.number_format = "0.0"

    # Freeze header row
    ws_data.freeze_panes = "A2"

    # Auto column width
    for col in ws_data.columns:
        max_len = max(len(str(cell.value or "")) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws_data.column_dimensions[col_letter].width = max(max_len + 4, 12)

    # Sheet 2: Facility Profile & Engineering Metadata
    ws_meta = wb.create_sheet(title="Facility_Profile_&_Metadata")
    ws_meta.views.sheetView[0].showGridLines = True

    meta_header_fill = PatternFill(start_color="0F766E", end_color="0F766E", fill_type="solid") # Teal 700
    meta_title_font = Font(name="Segoe UI", size=14, bold=True, color="0F172A")
    meta_sec_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    meta_bold = Font(name="Segoe UI", size=10, bold=True, color="1E293B")
    meta_regular = Font(name="Segoe UI", size=10, color="334155")

    ws_meta.cell(row=1, column=1, value="CIRCULEAK INDUSTRIAL TELEMETRY DATASET PROFILE").font = meta_title_font
    ws_meta.row_dimensions[1].height = 25

    metadata_rows = [
        ("Facility Name", "RK Industries"),
        ("Facility ID", "6"),
        ("Industry Sector", "Textile and Garment Dyeing"),
        ("Location / Cluster", "Surat Industrial Textile Cluster, Gujarat, India"),
        ("Primary Products", "Polyester & Cotton Knitted Fabrics (Dyeing, Printing, Finishing)"),
        ("Baseline Operating Hours", "16-24 hrs/day (2 active production shifts + night utility)"),
        ("Grid Electricity Factor", "0.716 kgCO2e/kWh (India CEA CO2 Baseline Database v19)"),
        ("Thermal Fuel Factor", "1.930 kgCO2e/m3 (Piped Natural Gas / PNG - IPCC 2006 / GAIL)"),
        ("Dataset Time Span", "14 Continuous Days (2026-08-28 00:00:00 to 2026-09-10 23:00:00)"),
        ("Total Asset Count", "7 Connected Production & Utility Machines"),
        ("Total Records", f"{len(records):,} Industrial Hourly Readings"),
        ("Data Fidelity", "Hourly Sub-system SCADA / PLC Smart Meter Synchronized")
    ]

    ws_meta.cell(row=3, column=1, value="FACILITY & AUDIT SPECIFICATION").font = meta_sec_font
    ws_meta.cell(row=3, column=1).fill = meta_header_fill
    ws_meta.cell(row=3, column=2).fill = meta_header_fill
    ws_meta.merge_cells(start_row=3, start_column=1, end_row=3, end_column=2)

    curr_r = 4
    for label, val in metadata_rows:
        c1 = ws_meta.cell(row=curr_r, column=1, value=label)
        c2 = ws_meta.cell(row=curr_r, column=2, value=val)
        c1.font = meta_bold
        c2.font = meta_regular
        c1.border = border_thin
        c2.border = border_thin
        curr_r += 1

    curr_r += 2
    ws_meta.cell(row=curr_r, column=1, value="MONITORED ASSET REGISTER & OPERATIONAL RANGES").font = meta_sec_font
    ws_meta.cell(row=curr_r, column=1).fill = meta_header_fill
    ws_meta.merge_cells(start_row=curr_r, start_column=1, end_row=curr_r, end_column=5)
    curr_r += 1

    asset_headers = ["Asset Name", "Process Department", "Power Rating (kWh/hr)", "Thermal Fuel", "Nominal Capacity"]
    for c_i, ah in enumerate(asset_headers, 1):
        c = ws_meta.cell(row=curr_r, column=c_i, value=ah)
        c.fill = header_fill
        c.font = header_font
        c.border = border_thin
    curr_r += 1

    asset_rows = [
        ("HTHP Jet Dyeing Machine #01", "Dyeing & Bleaching", "32 - 38 kWh", "None (Steam Exchanger)", "400 - 450 kg/batch"),
        ("Soft Flow Jet Dyeing Machine #02", "Dyeing & Bleaching", "26 - 32 kWh", "None (Atmospheric)", "320 - 360 kg/batch"),
        ("8-Chamber Stenter Frame", "Finishing & Heat Setting", "70 - 82 kWh", "Natural Gas (35 - 42 m3/hr)", "700 - 800 kg/hr"),
        ("Rotary Screen Printing Machine", "Printing & Curing", "36 - 44 kWh", "None (Electric Dryer)", "450 - 520 kg/hr"),
        ("Industrial Steam Boiler (Dual Fuel)", "Steam Generation Utility", "18 - 22 kWh", "Natural Gas (150 - 180 m3/hr)", "6,000 kg steam/hr"),
        ("Screw Air Compressor GA-75", "Compressed Air Utility", "54 - 65 kWh", "None", "12.5 m3/min @ 7.0 bar"),
        ("ETP Aeration Blower Station", "Wastewater & ETP Utility", "42 - 46 kWh", "None", "24/7 Biological Aeration")
    ]

    for ar in asset_rows:
        for c_i, val in enumerate(ar, 1):
            c = ws_meta.cell(row=curr_r, column=c_i, value=val)
            c.font = meta_regular
            c.border = border_thin
        curr_r += 1

    ws_meta.column_dimensions["A"].width = 38
    ws_meta.column_dimensions["B"].width = 32
    ws_meta.column_dimensions["C"].width = 25
    ws_meta.column_dimensions["D"].width = 30
    ws_meta.column_dimensions["E"].width = 28

    wb.save(output_path)
    print(f"Successfully generated {len(records)} realistic records to {output_path}")

if __name__ == "__main__":
    records = generate_textile_telemetry()
    dest_path = r"c:\Users\Raval Ruchit\Desktop\CircuLeak\Textile_Garment_Dyeing_Telemetry.xlsx"
    build_excel_workbook(records, dest_path)
