{{ config(
    materialized='table',
    file_format='parquet',
    location='s3a://mercury/smart_view/marts/campaign_performance'
) }}

WITH installs AS (
  SELECT
    media_source,
    campaign,
    app_id,
    platform,
    DATE_TRUNC('day', event_time) AS event_date,
    COUNT(DISTINCT user_id) AS install_count,
    SUM(cost) AS total_cost
  FROM {{ ref('stg_events') }}
  WHERE event_name = 'install'
  GROUP BY media_source, campaign, app_id, platform, event_date
),

purchases AS (
  SELECT
    media_source,
    campaign,
    app_id,
    platform,
    DATE_TRUNC('day', event_time) AS event_date,
    SUM(revenue) AS total_revenue
  FROM {{ ref('stg_events') }}
  WHERE event_name = 'af_purchase'
    AND event_time <= DATEADD(day, 7, event_date)
  GROUP BY media_source, campaign, app_id, platform, event_date
)

SELECT
  i.media_source,
  i.campaign,
  i.app_id,
  i.platform,
  i.event_date,
  i.install_count,
  i.total_cost,
  COALESCE(p.total_revenue, 0) AS total_revenue,
  CASE
    WHEN i.install_count > 0 THEN i.total_cost / i.install_count
    ELSE 0
  END AS cpi,
  CASE
    WHEN i.total_cost > 0 THEN (p.total_revenue / i.total_cost) * 100
    ELSE 0
  END AS roas_7d
FROM installs i
LEFT JOIN purchases p
  ON i.media_source = p.media_source
  AND i.campaign = p.campaign
  AND i.app_id = p.app_id
  AND i.platform = p.platform
  AND i.event_date = p.event_date