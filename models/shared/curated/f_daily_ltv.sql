-- reset value to prevent issue double total value in case unique key is changed
update daily_user_metrics
set rev_nru01 = 0, rev_nru07 = 0, rev_nru30 = 0
where event_date in (select distinct event_date from ztmp_daily_ltv);

-- update daily metrics
insert into daily_user_metrics (
        product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , rev_nru01, rev_nru07, rev_nru30, created_at
)
select  product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , rev_nru01, rev_nru07, rev_nru30, now() as created_at
from ztmp_daily_ltv
on conflict (product_id, event_date, agency, media_source, campaign_id, country_code, platform) do update
set rev_nru01 = excluded.rev_nru01, rev_nru07 = excluded.rev_nru07, rev_nru30 = excluded.rev_nru30, updated_at = now();