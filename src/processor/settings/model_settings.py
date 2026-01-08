from dataclasses import dataclass, field
from typing import Optional

@dataclass
class ColumnSettings:
  name: str
  type: Optional[str] = 'string'
  funcs: Optional[list[str]] = field(default_factory=list)
  alias: Optional[str] = None
  drop: Optional[bool] = False

@dataclass
class AggregationSettings:
  type: str
  dimensions: list[str]
  measures: list[ColumnSettings]
  order_by: Optional[list[str]] = field(default_factory=list)

@dataclass
class ModelSettings:
  location: str
  # name: Optional[str] = None
  type: Optional[str] = 'parquet'
  # load options
  case_sensitive: Optional[bool] = False
  options: Optional[dict[str, str]] = field(default_factory=dict)
  preprocess: Optional[str] = ''
  # save options
  num_partitions: Optional[int] = 1
  partition_by: Optional[list[str]] = field(default_factory=list)
  merge: Optional[bool] = False
  # temp_location: Optional[str] = None
  # transform options
  sql_model: Optional[str] = None
  columns: Optional[list[ColumnSettings]] = field(default_factory=list)
  query: Optional[list[str]] = field(default_factory=list)
  aggregation: Optional[AggregationSettings] = field(default_factory=list)

@dataclass
class ModelLayout:
  sources: list[ModelSettings]
  targets: list[ModelSettings]
