#!/bin/bash

product=$1
event_date=$2
action=$3
models=$4

# SPARK_LOCAL_HOSTNAME=localhost spark-submit \
#   --name "minerva::$product::$event_date::$action::$models" \
#   --master local[*] \
python3 src/app.py product=$product event_date=$event_date action=$action models=$models config_dir=../products