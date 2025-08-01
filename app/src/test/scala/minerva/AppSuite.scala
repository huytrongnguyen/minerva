/*
 * This Scala Testsuite was generated by the Gradle 'init' task.
 */
package minerva

import org.apache.spark.sql.SparkSession
import org.junit.jupiter.api.{BeforeEach, AfterEach, Test}
import org.junit.jupiter.api.Assertions.assertEquals

class AppSuite {
  private var spark: SparkSession = _

  @BeforeEach
  def setUp(): Unit = {
    spark = SparkSession.builder()
        .appName("MinervaTest")
        .master("local[*]")
        .getOrCreate()
  }

  @AfterEach
  def tearDown(): Unit = {
    if (spark != null) {
      spark.stop()
    }
  }

  @Test
  def testCreateDataFrame(): Unit = {
    val data = Seq(("Alice", 25), ("Bob", 30), ("Cathy", 28)) 
    val df = spark.createDataFrame(data).toDF("name", "age") 
    assertEquals(3, df.count(), "DataFrame should have 3 rows")
  }
}
