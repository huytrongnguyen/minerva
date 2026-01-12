#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

product_id=$1
start_date=$2
end_date=$3
models=$4
libs=$5

AIRFLOW_HOME=/usr/local/airflow

start=`date +"%Y-%m-%d" -d $start_date`
end=`date +"%Y-%m-%d" -d $end_date`

while [[ "$start" <= "$end" ]];
do
  event_date=$start
  sh spark-run.sh $product_id $event_date $models $libs
  start=`date +"%Y-%m-%d" -d "$start + 1 day"`;
done