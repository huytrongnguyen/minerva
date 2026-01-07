-- reset value to prevent issue double total value in case unique key is changed
update daily_ltv_metrics set cost_value = 0
where event_date in (select distinct event_date from ztmp_daily_cost);

-- update daily metrics
insert into daily_ltv_metrics (
        product_id, event_date, media_source, campaign_id, country_code, platform, currency_code
      , cost_value, created_at
)
select  product_id, event_date, media_source, campaign_id, country_code, platform, currency_code
      , cost_value, now() as created_at
from ztmp_daily_cost
on conflict (product_id, event_date, media_source, campaign_id, country_code, platform, currency_code) do update
set cost_value = excluded.cost_value, updated_at = now();
