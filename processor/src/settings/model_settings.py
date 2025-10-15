from dataclasses import dataclass, field
from typing import Optional

@dataclass
class ColumnSettings:
  name: str
  type: Optional[str] = 'string'
  transform: Optional[list[str]] = field(default_factory=list)
  alias: Optional[str] = None
  drop: Optional[bool] = False

@dataclass
class ModelSettings:
  location: str
  name: Optional[str] = None
  type: Optional[str] = 'parquet'
  case_sensitive: Optional[bool] = False
  num_partitions: Optional[int] = 1
  partition_by: Optional[list[str]] = field(default_factory=list)
  options: Optional[dict[str, str]] = field(default_factory=dict)
  columns: Optional[list[ColumnSettings]] = field(default_factory=list)

@dataclass
class ModelLayout:
  sources: list[ModelSettings]
  targets: list[ModelSettings]
