def format_currency(amount_inr: float) -> str:
    """Format currency in Indian Rupee format (₹)."""
    return f"₹{amount_inr:,.2f}"


def format_emissions(emissions_kg: float) -> str:
    """Format emissions into kgCO2e or tonnes CO2e."""
    if emissions_kg >= 1000:
        tonnes = emissions_kg / 1000.0
        return f"{tonnes:,.2f} tCO2e"
    return f"{emissions_kg:,.2f} kgCO2e"
