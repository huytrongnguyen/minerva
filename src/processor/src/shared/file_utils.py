import json
from typing import Any

def load_text(file_path: str):
  text = ''
  with open(file_path, 'r') as file:
    text = file.read()
  return text

def load_json(file_path: str) -> dict[str, Any]:
  data = {}
  with open(file_path, 'r') as json_file:
    data = json.load(json_file)
  return data