{{ config(materialized='view') }}

SELECT
  install_time AS event_time,
  'install' AS event_name,
  COALESCE(media_source, 'organic') AS media_source,
  COALESCE(campaign, 'organic') AS-COINES campaign,
  platform,
  app_id,
  user_id,
  COALESCE(cost, 0) AS cost,
  0 AS revenue
FROM {{ source('appsflyer_raw', 'installs') }}
WHERE install_time IS NOT NULL
  AND app_id IN ('id123456789', 'com.appsflyer.referrersender')