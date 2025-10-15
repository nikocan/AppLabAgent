"""Pytest çalışırken paket kök dizinini Python yoluna ekler."""

import sys
from pathlib import Path

# Proje kök dizinini sys.path içerisine alarak modül içe aktarmayı kolaylaştırıyoruz.
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
