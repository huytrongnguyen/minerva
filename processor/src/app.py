import sys

from processor.src.connector.spark import spark_runner

from src.shared import file_utils
from src.settings.job_settings import JobSettings
from src.settings.product_settings import ProductSettings

def main():
  if len(sys.argv) < 2:
    raise ValueError('No arguments passed.')

  settings = JobSettings.parse(sys.argv[1:])
  product_settings = ProductSettings(**file_utils.load_json(f'{settings.config_dir}/{settings.product_id}/profile.json'))

  if settings.connector == 'spark': spark_runner.run(product_settings, settings)
  else: print(f'Unknown connector: {settings.connector}')

if __name__ == "__main__":
  main()