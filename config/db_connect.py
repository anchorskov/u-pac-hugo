import psycopg2
from psycopg2 import Error
from config import DB_CONFIG_PSQL  # Import the PostgreSQL configuration

def get_db_connection():
    """Establish a secure PostgreSQL connection using DB_CONFIG_PSQL."""
    try:
        connection = psycopg2.connect(
            host=DB_CONFIG_PSQL['host'],
            port=DB_CONFIG_PSQL['port'],
            user=DB_CONFIG_PSQL['user'],
            password=DB_CONFIG_PSQL['password'],
            database=DB_CONFIG_PSQL['database']
        )
        return connection
    except Error as e:
        print(f"❌ Database Connection Error: {e}")
        return None

def list_tables():
    """List all tables in the 'public' schema of the sibidrift database."""
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
            )
            tables = cursor.fetchall()
            print("Tables in the database:")
            for table in tables:
                print(table[0])
        except Error as e:
            print(f"❌ Error listing tables: {e}")
        finally:
            if connection:
                cursor.close()
                connection.close()
    else:
        print("❌ Unable to establish database connection.")

if __name__ == "__main__":
    list_tables()
