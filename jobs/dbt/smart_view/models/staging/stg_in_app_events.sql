{{ config(materialized='view') }}

SELECT
  event_time,
  event_name,
  COALESCE(media_source, 'organic') AS media_source,
  COALESCE(campaign, 'organic') AS campaign,
  platform,
  app_id,
  user_id,
  0 AS cost,
  COALESCE(TRY_PARSE_JSON(event_value):revenue::FLOAT, 0) AS revenue
FROM {{ source('appsflyer_raw', 'in_app_events') }}
WHERE event_time IS NOT NULL
  AND event_name = 'af_purchase'
  AND app_id IN ('id123456789', 'com.appsflyer.referrersender')