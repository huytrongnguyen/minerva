from typing import Any
from dataclasses import dataclass

@dataclass
class ProductSettings:
  inputs: dict[str, Any]
  datastore: dict[str, Any]
  outputs: dict[str, Any]
  vars: dict[str, Any]