import pytest
from pyspark.sql import SparkSession

@pytest.fixture(scope="session")
def spark():
    spark = SparkSession.builder \
        .appName("SparkApp") \
        .master("local[*]") \
        .config("spark.ui.enabled", "false") \
        .getOrCreate()
    yield spark
    spark.stop()

def test_create_dataframe(spark):
    data = [("Alice", 25), ("Bob", 30), ("Cathy", 28)]
    df = spark.createDataFrame(data, ["name", "age"])

    print("Print Schema")
    df.printSchema()

    print("Show DataFrame")
    df.show()

    assert df.count() == 3, "DataFrame should have 3 rows"