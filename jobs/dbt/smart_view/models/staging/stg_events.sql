{{ config(materialized='view') }}

SELECT
  event_time,
  event_name,
  media_source,
  campaign,
  platform,
  app_id,
  user_id,
  cost,
  revenue
FROM {{ ref('stg_installs') }}
UNION ALL
SELECT
  event_time,
  event_name,
  media_source,
  campaign,
  platform,
  app_id,
  user_id,
  cost,
  revenue
FROM {{ ref('stg_in_app_events') }}