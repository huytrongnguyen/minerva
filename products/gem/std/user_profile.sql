merge into user_profile t
using user_activity s
on t.user_id = s.user_id
on t.product_id = s.product_id
when matched and t.matching_time < s.matching_time and s.install_time < t.install_time then
update set  t.matching_time = s.matching_time, t.install_time = s.install_time
          , t.registration_time = least(t.registration_time, s.registration_time)
          , t.first_login_time = least(t.first_login_time, s.first_login_time)
          , t.last_login_time = greatest(t.last_login_time, s.last_login_time)
          , t.first_purchase_time = least(t.first_purchase_time, s.first_purchase_time)
          , t.last_purchase_time = greatest(t.last_purchase_time, s.last_purchase_time)
          , t.install_id = s.install_id, t.media_source = s.media_source, t.campaign_id = s.campaign_id
          , t.country_code = s.country_code, t.platform = s.platform
when matched then
update set  t.first_login_time = least(t.first_login_time, s.first_login_time)
          , t.last_login_time = greatest(t.last_login_time, s.last_login_time)
          , t.first_purchase_time = least(t.first_purchase_time, s.first_purchase_time)
          , t.last_purchase_time = greatest(t.last_purchase_time, s.last_purchase_time)
when not matched then
insert (
  user_id, install_time, registration_time, matching_time
, first_login_time, last_login_time, first_purchase_time, last_purchase_time
, install_id, media_source, campaign_id, country_code, platform, product_id
)
values (
  s.user_id, s.install_time, s.registration_time, s.matching_time
, s.first_login_time, s.last_login_time, s.first_purchase_time, s.last_purchase_time
, s.install_id, s.media_source, s.campaign_id, s.country_code, s.platform, s.product_id
)