from typing import Any, Dict, List
from jinja2 import Environment
from datetime import datetime, timedelta

# Initialize Jinja
jinja_env = Environment()

def render_template(template: str, vars: Dict[str, Any]): return jinja_env.from_string(template).render(**vars)

def date_range(base: str, before: int, after: int = 0) -> List[str]:
  base_date = datetime.strptime(base, '%Y-%m-%d')
  return [(base_date + timedelta(days = x)).strftime('%Y-%m-%d') for x in range(-before, after + 1)]