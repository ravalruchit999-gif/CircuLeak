import os
import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from app.core.config import settings
from app.services.facility_service import FacilityService
from app.services.emission_service import EmissionService
from app.services.leak_service import LeakService
from app.services.priority_service import PriorityService
from app.services.benchmark_service import BenchmarkService
from app.services.circularity_service import CircularityService
from app.services.trajectory_service import TrajectoryService
from app.services.audit_service import AuditService


class ReportService:
    @staticmethod
    def generate_pdf_report(db: Session, facility_id: int) -> Dict[str, Any]:
        """
        Generate a comprehensive 12-section PDF Industrial Carbon Audit Report.
        """
        facility = FacilityService.get_facility(db, facility_id)
        if not facility:
            raise ValueError(f"Facility {facility_id} not found.")

        summary = EmissionService.calculate_summary(db, facility_id)
        hotspots = LeakService.get_structural_hotspots(db, facility_id).get("hotspots", [])
        anomalies = LeakService.get_anomalies(db, facility_id).get("anomalies", [])
        priority_res = PriorityService.rank_interventions(db, facility_id)
        benchmark = BenchmarkService.get_benchmark(db, facility_id)
        circularity = CircularityService.calculate_circularity_score(db, facility_id)
        trajectory = TrajectoryService.calculate_5year_trajectory(db, facility_id)
        audit = AuditService.generate_audit_summary(db, facility_id)

        timestamp_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"CircuLeak_Audit_Facility_{facility_id}_{timestamp_str}.pdf"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)

        doc = SimpleDocTemplate(
            filepath,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#1b4332"),
            spaceAfter=12
        )
        heading_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#2d6a4f"),
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#212529")
        )
        bold_body = ParagraphStyle(
            'BoldBody',
            parent=body_style,
            fontName='Helvetica-Bold'
        )

        elements = []

        # Header / Title
        elements.append(Paragraph("CircuLeak Industrial Carbon Audit", title_style))
        elements.append(Paragraph(f"Executive Decision-Support Report — Facility: <b>{facility.business_name}</b>", body_style))
        elements.append(Paragraph(f"Audit Date: {datetime.datetime.now(datetime.timezone.utc).strftime('%B %d, %Y')} | Sector: {facility.sector}", body_style))
        elements.append(Spacer(1, 10))

        # 1. Executive Summary
        elements.append(Paragraph("1. Executive Summary", heading_style))
        narrative_clean = audit["executive_narrative"].replace("\n", "<br/>")
        elements.append(Paragraph(narrative_clean, body_style))
        elements.append(Spacer(1, 10))

        # 2. Facility Profile Table
        elements.append(Paragraph("2. Facility Profile", heading_style))
        fac_table_data = [
            ["Business Name", facility.business_name, "Sector", facility.sector],
            ["Location", facility.location, "Production Type", facility.production_type],
            ["Production Volume", f"{facility.production_volume:,.0f} units", "Operating Hours", f"{facility.operating_hours} hrs/day"],
            ["Employees", str(facility.employees), "Energy Sources", ", ".join([str(s) for s in (facility.energy_sources or [])])]
        ]
        t_fac = Table(fac_table_data, colWidths=[110, 150, 110, 160])
        t_fac.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8f9fa")),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#212529")),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_fac)
        elements.append(Spacer(1, 10))

        # 3. Emission Overview
        elements.append(Paragraph("3. Emission Overview", heading_style))
        emiss_table_data = [
            ["Metric", "Value", "Benchmark & Regulatory Context"],
            ["Total Emissions", f"{summary['total_emissions']:,.1f} kgCO2e ({summary['total_emissions_tonnes']} tCO2e)", "Total verified operational footprint"],
            ["Emission Intensity", f"{summary['emissions_intensity']} {benchmark['unit']}", f"Sector Avg: {benchmark['benchmark_average']} ({benchmark['performance']})"],
            ["CCTS Regulatory Threshold", f"{benchmark['ccts_threshold']} {benchmark['unit']}", f"Status: {benchmark['ccts_compliance_status']}"],
            ["Total Electricity", f"{summary['total_electricity_kwh']:,.1f} kWh", "Grid Factor: 0.716 kgCO2e/kWh (India CEA v19)"]
        ]
        t_emiss = Table(emiss_table_data, colWidths=[140, 150, 240])
        t_emiss.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2d6a4f")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f9fa")]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_emiss)
        elements.append(Spacer(1, 10))

        # 4. Top Carbon Leaks (Structural Hotspots)
        elements.append(Paragraph("4. Top Carbon Leaks (Structural Hotspots)", heading_style))
        hotspot_table_data = [["Rank", "Equipment", "Process", "Emissions (kgCO2e)", "% Total"]]
        for h in hotspots[:5]:
            hotspot_table_data.append([
                str(h["rank"]), h["equipment"], h["process"], f"{h['emissions_kg']:,.1f}", f"{h['percentage_of_total']}%"
            ])
        t_hot = Table(hotspot_table_data, colWidths=[40, 150, 150, 110, 80])
        t_hot.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#40916c")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f9fa")]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(t_hot)
        elements.append(Spacer(1, 10))

        # 5. Behavioral Anomalies
        elements.append(Paragraph("5. Behavioral Anomalies Detected", heading_style))
        if anomalies:
            anom_table_data = [["Equipment", "Period", "Risk", "Baseline", "Observed", "Diagnosis"]]
            for a in anomalies[:4]:
                anom_table_data.append([
                    a["equipment"],
                    a["abnormal_period"][:18],
                    f"{a['risk_score']}",
                    f"{a['baseline_consumption']}",
                    f"{a['observed_consumption']}",
                    a["reason"][:45] + "..."
                ])
            t_anom = Table(anom_table_data, colWidths=[100, 100, 45, 55, 55, 175])
            t_anom.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#b7094c")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
                ('FONTSIZE', (0, 0), (-1, -1), 7.5),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#fff0f3")]),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
            ]))
            elements.append(t_anom)
        else:
            elements.append(Paragraph("No severe behavioral anomalies detected in current dataset.", body_style))
        elements.append(Spacer(1, 10))

        # 6. Intervention Priority & ROI Analysis
        elements.append(Paragraph("6. Intervention Priority & Financial ROI", heading_style))
        ranked_interventions = priority_res.get("ranked_interventions", [])
        if ranked_interventions:
            p_table_data = [["#", "Intervention", "CO2 Saved (kg)", "Investment (₹)", "Annual Savings (₹)", "Payback", "Feasibility"]]
            for p in ranked_interventions[:5]:
                p_table_data.append([
                    str(p["priority_rank"]),
                    p["recommendation"][:26],
                    f"{p['co2_reduction']:,.0f}",
                    f"₹{p['investment']:,.0f}",
                    f"₹{p['annual_savings']:,.0f}",
                    f"{p['payback_years']} yrs",
                    p["feasibility"]
                ])
            t_p = Table(p_table_data, colWidths=[20, 160, 75, 85, 90, 50, 50])
            t_p.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1b4332")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
                ('FONTSIZE', (0, 0), (-1, -1), 7.5),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f9fa")]),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
            ]))
            elements.append(t_p)
        elements.append(Spacer(1, 10))

        # 7. Circularity Score & 5-Year Trajectory
        elements.append(Paragraph("7. Circularity Score & 5-Year Decarbonization Trajectory", heading_style))
        circ_text = (
            f"<b>Circularity Rating:</b> Current Score = <b>{circularity['overall_score']}/100</b> ({circularity['grade']}). "
            f"Projected Score post-interventions = <b>{circularity['projected_score_after_interventions']}/100</b>."
        )
        elements.append(Paragraph(circ_text, body_style))
        elements.append(Spacer(1, 6))

        traj_table_data = [["Year", "Baseline (kgCO2e)", "With Actions (kgCO2e)", "Annual Reduction", "Cumulative Savings"]]
        for row in trajectory.get("trajectory", []):
            traj_table_data.append([
                str(row["year"]),
                f"{row['baseline_emissions']:,.0f}",
                f"{row['with_actions_emissions']:,.0f}",
                f"{row['annual_co2_reduction']:,.0f} kg",
                f"₹{row['cumulative_savings']:,.0f}"
            ])
        t_traj = Table(traj_table_data, colWidths=[50, 120, 120, 110, 130])
        t_traj.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2d6a4f")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
            ('FONTSIZE', (0, 0), (-1, -1), 7.5),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f9fa")]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(t_traj)
        elements.append(Spacer(1, 12))

        # Footer note
        elements.append(Paragraph("Generated by CircuLeak Platform — Decision Support Engine for Industrial Decarbonization.", ParagraphStyle('Footer', parent=body_style, fontSize=7, textColor=colors.gray)))

        # Build document
        doc.build(elements)

        file_size = os.path.getsize(filepath)

        return {
            "facility_id": facility_id,
            "report_title": "CircuLeak Industrial Carbon Audit",
            "file_name": filename,
            "download_url": f"/api/report/download/{filename}",
            "file_size_bytes": file_size,
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
