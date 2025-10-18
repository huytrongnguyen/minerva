import re
from typing import Any
from jinja2 import Environment

def parse(template: str, context: dict[str, Any]):
  try:
    return Environment().from_string(template).render(**context)
  except Exception as ex:
    print(f'Cannot parse "{template}" caused by: ${ex}')
    return template

def parse_function_name_and_arguments(func: str) -> tuple[str, list[str]]:
  match = re.match(r'(.*?)\((.*)\)', func)
  if match: return (match.group(1).strip(), match.group(2).strip().split(','))
  else: return (func, [])