import psycopg2
from psycopg2 import Error
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def execute_query(query: str, cred: dict[str, str]):
  try:
    conn = open_connection(cred)
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

def open_connection(cred: dict[str, str]):
  # connector = {
  #   'host': cred['host'],
  #   'port': cred['port'],
  #   'database': cred['database'],
  #   'sslmode': cred['sslmode'],
  #   'user': cred['user'],
  #   'password': cred['password'],
  # }

  print(f"conn_string = {cred['conn_string']}")

  conn = psycopg2.connect(cred['conn_string'])
  # print(f"Info: Connected to '{connector['host']}:{connector['port']}/{connector['database']}' with user '{connector['user']}'")
  return conn