from typing import Any
from jinja2 import Environment

def parse(template: str, context: dict[str, Any]):
  return Environment().from_string(template).render(**context)