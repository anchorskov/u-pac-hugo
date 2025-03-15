import sys
import os
# Ensure the project root is in sys.path so that we can import config
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import json
import mysql.connector
from config.config import DB_CONFIG  # Import the MySQL configuration

# --- Step 1: Connect to the MySQL Database ---
conn = mysql.connector.connect(
    host=DB_CONFIG["host"],
    port=DB_CONFIG["port"],
    user=DB_CONFIG["user"],
    password=DB_CONFIG["password"],
    database=DB_CONFIG["database"],
)
cursor = conn.cursor()

# --- Step 2: Query the Joined Data ---
query = """
SELECT u.id, u.name, u.state, u.district_id, u.party, u.phone, u.committee_assignments,
       u.website, u.created_at, s.abbreviation
FROM upac_representatives u
JOIN upac_states s ON u.state = s.name
ORDER BY u.state, u.district_id
"""
cursor.execute(query)
rows = cursor.fetchall()

# --- Step 3: Generate the JSON Mapping ---
data = {}
for row in rows:
    (id_, name, state, district_id, party, phone, committees, website, created_at, abbreviation) = row

    # Use district_id as is (e.g., "01", "02", "00" for at-large)
    # Create the composite key in the format "StateAbbreviation-District"
    composite_key = f"{abbreviation}-{district_id}"

    # Format created_at field if needed
    if hasattr(created_at, "strftime"):
        created_at_str = created_at.strftime("%Y-%m-%d %H:%M:%S")
    else:
        created_at_str = str(created_at)

    candidate_info = {
        "id": id_,
        "name": name,
        "state": state,
        "district_id": district_id,
        "party": party,
        "phone": phone,
        "committee_assignments": committees,
        "website": website,
        "created_at": created_at_str,
        "state_abbreviation": abbreviation
    }

    data[composite_key] = candidate_info

# --- Step 4: Write the JSON Data to a File ---
output_file = "upac_representatives.json"
with open(output_file, "w") as f:
    json.dump(data, f, indent=2)

cursor.close()
conn.close()
print(f"JSON file generated successfully at: {output_file}")
