from typing import Any
from dataclasses import dataclass

@dataclass
class ProductSettings:
  sources: dict[str, Any]
  targets: dict[str, Any]
  vars: dict[str, Any]