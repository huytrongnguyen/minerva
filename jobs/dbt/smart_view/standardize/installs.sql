{{ config(materialized='view') }}

select  bundle_id
      , app_id
      , appsflyer_id as install_id
      , install_time
      , coalesce(media_source, 'organic') media_source
      , af_c_id as campaign_id
      , campaign
      , af_cost_value as cost
      , af_cost_currency as cost_currency
      , platform
      , device_model
      , os_version
      , country_code
      , ip
from {{ source('appsflyer', 'installs') }}
where install_time is not null