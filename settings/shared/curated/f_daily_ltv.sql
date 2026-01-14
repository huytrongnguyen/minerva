-- reset value to prevent issue double total value in case unique key is changed
update daily_ltv_metrics
set ltv00 = 0, ltv30 = 0, ltv60 = 0, ltv90 = 0
where event_date in (select distinct event_date from ztmp_daily_ltv);

-- update daily metrics
insert into daily_ltv_metrics (
        product_id, event_date, media_source, campaign_id, country_code, platform, currency_code
      , ltv00, ltv30, ltv60, ltv90, created_at
)
select  product_id, event_date, media_source, campaign_id, country_code, platform, currency_code
      , ltv00, ltv30, ltv60, ltv90, now() as created_at
from ztmp_daily_ltv
on conflict (product_id, event_date, media_source, campaign_id, country_code, platform, currency_code) do update
set ltv00 = excluded.ltv00, ltv30 = excluded.ltv30, ltv60 = excluded.ltv60, ltv90 = excluded.ltv90, updated_at = now();
