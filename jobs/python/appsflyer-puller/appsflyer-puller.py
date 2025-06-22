import requests
import boto3
import json
import os
import sys
import logging

logging.basicConfig(level=logging.INFO)

def load_config(config_s3_bucket="appsflyer-config", config_s3_key="api_config.json"):
    """Load JSON configuration from MinIO S3."""
    try:
        s3_client = boto3.client(
            "s3",
            endpoint_url=os.getenv("MINIO_ENDPOINT"),
            aws_access_key_id=os.getenv("MINIO_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("MINIO_SECRET_KEY")
        )
        obj = s3_client.get_object(Bucket=config_s3_bucket, Key=config_s3_key)
        config = json.loads(obj["Body"].read().decode("utf-8"))
        required_keys = ["endpoint", "method", "s3_bucket", "s3_key_prefix"]
        if not all(key in config for key in required_keys):
            raise ValueError(f"Missing required config keys: {required_keys}")
        return config
    except Exception as e:
        logging.error(f"Failed to load config from s3://{config_s3_bucket}/{config_s3_key}: {str(e)}")
        raise

def pull_and_save_to_s3(date_str, app_id, api_token, config_s3_bucket="appsflyer-config", config_s3_key="api_config.json"):
    """Pull data from external API and save to S3 based on JSON config from MinIO."""
    # Load configuration from MinIO
    config = load_config(config_s3_bucket, config_s3_key)

    # Configure MinIO client
    s3_client = boto3.client(
        "s3",
        endpoint_url=os.getenv("MINIO_ENDPOINT"),
        aws_access_key_id=os.getenv("MINIO_ACCESS_KEY"),
        aws_secret_access_key=os.getenv("MINIO_SECRET_KEY")
    )

    # Prepare API request
    endpoint = config["endpoint"].format(app_id=app_id)
    method = config.get("method", "GET").upper()
    headers = {k: v.format(api_token=api_token) for k, v in config.get("headers", {}).items()}
    params = {k: v.format(date_str=date_str) for k, v in config.get("params", {}).items()}
    s3_bucket = config["s3_bucket"]
    s3_key = config["s3_key_prefix"].format(app_id=app_id, date_str=date_str)

    # Make API request with retries
    try:
        session = requests.Session()
        retries = requests.adapters.Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
        session.mount("https://", requests.adapters.HTTPAdapter(max_retries=retries))

        if method == "GET":
            with session.get(endpoint, params=params, headers=headers, stream=True, timeout=300) as response:
                response.raise_for_status()
                s3_client.upload_fileobj(
                    Fileobj=response.raw,
                    Bucket=s3_bucket,
                    Key=s3_key
                )
        elif method == "POST":
            with session.post(endpoint, json=params, headers=headers, stream=True, timeout=300) as response:
                response.raise_for_status()
                s3_client.upload_fileobj(
                    Fileobj=response.raw,
                    Bucket=s3_bucket,
                    Key=s3_key
                )
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        logging.info(f"Saved data to s3://{s3_bucket}/{s3_key}")
        return s3_key
    except Exception as e:
        logging.error(f"Error pulling data for app_id {app_id}: {str(e)}")
        raise

if __name__ == "__main__":
    if len(sys.argv) != 4:
        logging.error("Usage: python appsflyer_puller.py <date> <app_id> <api_token>")
        sys.exit(1)
    date_str, app_id, api_token = sys.argv[1], sys.argv[2], sys.argv[3]
    s3_key = pull_and_save_to_s3(date_str, app_id, api_token)
    print(s3_key)