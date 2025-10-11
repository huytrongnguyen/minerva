from dataclasses import dataclass, field
from typing import Optional

@dataclass
class DataColumn:
  name: str
  transform: Optional[list[str]] = field(default_factory=list)
  alias: Optional[str] = None

@dataclass
class DataModel:
  location: str
  schema: list[DataColumn]
  name: Optional[str] = None
  type: Optional[str] = None

@dataclass
class ModelLayout:
  sources: list[DataModel]
  targets: list[DataModel]
