import psycopg2
from psycopg2 import Error
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def execute_query(query: str, cred: dict[str, str]):
  try:
    conn = psycopg2.connect(cred['conn_string'])
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    cursor.execute(query)
  except (Exception, Error) as error:
    print('Error while connecting: ', error)
  finally:
    # Always close cursor and connection to avoid leaks
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
      conn.close()
      print('Connection closed.')
