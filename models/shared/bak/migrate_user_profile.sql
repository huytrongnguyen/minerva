{{
  create_or_replace_table({
    'location': '{{lakehouse.location}}/{{product_id}}/curated/user_profile',
  })
}}

select *
from {{
  source({
    'name': 'user_profile',
    'location': '{{lakehouse.location}}/{{product_id}}/enriched/user_profile',
  })
}}