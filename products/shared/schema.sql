create table if not exist std.installs_report (
  event_id string,
  event_time timestamp,
  event_name string,
  event_currency string,
  event_value string,
  product_id string,
  report_date date,
  media_source string,
  campaign string,
  campaign_id string,
  adset string,
  adset_id string,
  ad string,
  ad_id string,
  country_code string,
  install_id string,
  user_id,
  platform,
  app_id,
  cost_value
  cost_currency string,
  device_model string
) partition by report_date;