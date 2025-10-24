import sys
from connector.spark import spark_runner
from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings
from shared import file_utils, string_utils

if len(sys.argv) < 2:
  raise ValueError('No arguments passed.')

settings = JobSettings(**string_utils.convert_args_to_dict(sys.argv[1:]))
product_settings = ProductSettings(**file_utils.load_json(f'{settings.config_dir}/{settings.product_id}/profile.json'))

if settings.connector == 'spark': spark_runner.run(product_settings, settings)
else: print(f'Unknown connector: {settings.connector}')
