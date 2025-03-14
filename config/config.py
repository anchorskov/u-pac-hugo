import os
from dotenv import load_dotenv

# Load the .env file located in the config folder
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)

# Primary database configuration
DB_CONFIG = {
    "host": os.getenv("DB1_HOST"),
    "port": int(os.getenv("DB1_PORT")),
    "user": os.getenv("DB1_USER"),
    "password": os.getenv("DB1_PASSWORD"),
    "database": os.getenv("DB1_NAME"),
}

# Primary database configuration
DB_CONFIG1 = {
    "host": os.getenv("DB1_HOST"),
    "port": int(os.getenv("DB1_PORT")),
    "user": os.getenv("DB1_USER"),
    "password": os.getenv("DB1_PASSWORD"),
    "database": os.getenv("DB1_NAME"),
}

# Secondary database configuration
DB_CONFIG2 = {
    "host": os.getenv("DB2_HOST"),
    "port": int(os.getenv("DB2_PORT")),
    "user": os.getenv("DB2_USER"),
    "password": os.getenv("DB2_PASSWORD"),
    "database": os.getenv("DB2_NAME"),
}

# PSQL database configuration (db_config_psql)
DB_CONFIG_PSQL = {
    "host": os.getenv("DB3_HOST"),
    "port": int(os.getenv("DB3_PORT")),
    "user": os.getenv("DB3_USER"),
    "password": os.getenv("DB3_PASSWORD"),
    "database": os.getenv("DB3_NAME"),
}

USE_ML_MAPPING = os.getenv("USE_ML_MAPPING") == "True"
