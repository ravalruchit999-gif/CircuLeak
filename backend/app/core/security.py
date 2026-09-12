import re
import os
from typing import Optional


def sanitize_filename(filename: str) -> str:
    """Sanitize uploaded filenames to prevent path traversal attacks."""
    clean_name = os.path.basename(filename)
    clean_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', clean_name)
    return clean_name


def validate_csv_extension(filename: str) -> bool:
    """Validate that uploaded file is a CSV."""
    return filename.lower().endswith(".csv")
