with user_purchase_usd as (
  select  product_id, user_id
        , min(first_payment_time) as first_payment_time
        , max(last_payment_time) as last_payment_time
        , sum(revenue_usd) as revenue_usd
        , sum(number_of_payments) as number_of_payments
  from purchase
  group by product_id, user_id
)

select  product_id, to_date('{{event_date}}') as event_date, user_id
      , install_time, register_time, agency, media_source, campaign_id, country_code, platform, install_id
      , first_login_time, last_login_time, session_count
      , first_payment_time, last_payment_time, revenue_usd, number_of_payments
from complete_registration
full outer join login using (product_id, user_id)
full outer join user_purchase_usd using (product_id, user_id)