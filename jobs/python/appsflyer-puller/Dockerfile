FROM python:3.9-slim
WORKDIR /app
COPY appsflyer-puller.py .
RUN pip install requests boto3
CMD ["python", "appsflyer-puller.py"]