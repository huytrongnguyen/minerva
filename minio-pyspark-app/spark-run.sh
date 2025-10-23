SPARK_LOCAL_HOSTNAME=localhost spark-submit \
  --conf spark.hadoop.fs.s3a.endpoint=http://localhost:9000 \
  --conf spark.hadoop.fs.s3a.access.key=admin \
  --conf spark.hadoop.fs.s3a.secret.key=password \
  --conf spark.hadoop.fs.s3a.path.style.access=true \
  --conf spark.hadoop.fs.s3a.connection.ssl.enabled=false \
  --conf spark.hadoop.fs.s3a.impl=org.apache.hadoop.fs.s3a.S3AFileSystem \
  --conf spark.hadoop.fs.s3a.aws.credentials.provider=org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider \
  --conf spark.hadoop.fs.s3a.connection.timeout=60 \
  --conf spark.hadoop.fs.s3a.connection.establish.timeout=60 \
  --conf spark.hadoop.fs.s3a.threads.keepalivetime=60 \
  --conf spark.hadoop.fs.s3a.multipart.purge.age=86400 \
  --conf spark.hadoop.fs.obs.multipart.purge.age=86400 \
  --jars ../../../libs/hadoop-aws-3.3.4.jar,../../../libs/aws-java-sdk-bundle-1.12.262.jar \
  src/app.py