from typing import Any
from jinja2 import Environment

def parse(template: str, context: dict[str, Any]):
  try:
    return Environment().from_string(template).render(**context)
  except Exception as ex:
    print(f'Cannot parse "{template}" caused by: ${ex}')
    return template