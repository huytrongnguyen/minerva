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
  name: Optional[str] = None
  type: Optional[str] = 'parquet'
  caseSensitive: Optional[bool] = False
  numPartitions: Optional[int] = 4
  partitionColumns: Optional[list[str]] = field(default_factory=list)
  options: Optional[dict[str, str]] = field(default_factory=dict)
  schema: Optional[list[DataColumn]] = field(default_factory=list)

@dataclass
class ModelLayout:
  sources: list[DataModel]
  targets: list[DataModel]
