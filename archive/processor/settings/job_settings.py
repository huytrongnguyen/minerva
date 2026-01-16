from os import path
from dataclasses import dataclass
from typing import Optional

@dataclass
class JobSettings:
  models: str
  connector: Optional[str] = 'spark'
  product_id: Optional[str] = ''
  event_date: Optional[str] = ''
  config_dir: Optional[str] = path.dirname(__file__) + '/../../../products'
  libs: Optional[str] = ''
