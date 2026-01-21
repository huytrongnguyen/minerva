from typing import Optional, Dict, List
from dataclasses import dataclass, field

@dataclass
class JobSettings:
  models: str
  product_id: Optional[str] = ''
  event_date: Optional[str] = ''
  settings_dir: Optional[str] = '/opt/airflow/settings'

@dataclass
class ModelSettings:
  location: str
  name: Optional[str] = None
  type: Optional[str] = 'parquet'
  # load options
  case_sensitive: Optional[bool] = False
  options: Optional[Dict[str, str]] = field(default_factory=dict)
  preprocess: Optional[str] = ''
  default_when_blank: Optional[bool] = False
  # save options
  num_partitions: Optional[int] = 1
  partition_by: Optional[List[str]] = field(default_factory=list)
  merge: Optional[bool] = False
  postprocess: Optional[str] = ''