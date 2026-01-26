-- reset value to prevent issue double total value in case unique key is changed
update daily_user_metrics
set nru = 0, npu = 0, dau = 0, pu = 0, rev = 0, rev_npu = 0, rev_nru00 = 0
where event_date in (select distinct event_date from ztmp_daily_activity);

-- update daily metrics
insert into daily_user_metrics (
        product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , nru, npu, dau, pu, rev, rev_npu, rev_nru00, created_at
)
select  product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , nru, npu, dau, pu, rev, rev_npu, rev_nru00, now() as created_at
from ztmp_daily_activity
on conflict (product_id, event_date, agency, media_source, campaign_id, country_code, platform) do update
set nru = excluded.nru, npu = excluded.npu, dau = excluded.dau, pu = excluded.pu
  , rev = excluded.rev, rev_npu = excluded.rev_npu, rev_nru00 = excluded.rev_nru00, updated_at = now();