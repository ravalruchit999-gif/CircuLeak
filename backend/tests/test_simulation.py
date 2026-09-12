import pytest
from app.utils.calculations import calculate_payback


def test_payback_calculation():
    """Verify simple payback period arithmetic."""
    # 250,000 INR capex / 100,000 INR annual savings = 2.50 years
    payback = calculate_payback(250000.0, 100000.0)
    assert payback == 2.50

    # Zero savings test
    assert calculate_payback(250000.0, 0.0) == 999.0
