from typing import Any
from pyspark.sql import DataFrame
from src.settings.model_settings import DataModel
from src.shared import string_utils

def process(sourceData: DataFrame, target: DataModel, settings: dict[str, Any]):
  sourceData.printSchema()
  sourceData.show(5, False)
  print(f'Try to save data to "{string_utils.parse(target.location, settings)}"')