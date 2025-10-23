import re
from functools import reduce
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

def convert_args_to_dict(args: list[str]) -> dict[str, str]:
  def combine_dict(dict: dict[str, str], arg: str) -> dict[str, str]:
    arr = arg.split('=')
    dict[arr[0]] = arr[1]
    return dict

  return reduce(lambda dict, arg: combine_dict(dict, arg), args, {})
