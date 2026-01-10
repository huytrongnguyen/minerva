#!/bin/bash

product_id=$1
event_date=$2
action=$3
models=$4

# SPARK_LOCAL_HOSTNAME=localhost spark-submit \
#   --name "minerva::$product_id::$event_date::$action::$models" \
#   --master local[*] \
python3 app.py product_id=$product_id event_date=$event_date action=$action models=$models config_dir=../../products #libs=libs/postgresql-42.7.8.jar