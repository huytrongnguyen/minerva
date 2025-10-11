from os import path
from dataclasses import dataclass

@dataclass
class JobSettings:
  product_id = ''
  event_date = ''
  action = ''
  models = ''
  config_dir = '../../products'

  @classmethod
  def parse(cls, args: list[str]):
    job_settings = cls()

    for pair in args:
      entry = pair.split('=', 1) # Split on first '=' only
      if len(entry) >= 2:
        if entry[0] == 'product_id':
          job_settings.product_id = entry[1]
        elif entry[0] == 'event_date':
          job_settings.event_date = entry[1]
        elif entry[0] == 'action':
          job_settings.action = entry[1]
        elif entry[0] == 'models':
          job_settings.models = entry[1]
        else:
          print(f'Unknown field: {entry[0]}')
      else:
        print(f'Unknown parameter: {pair}')

    return job_settings