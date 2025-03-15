import sys
import os
import json
import mysql.connector
from config.config import DB_CONFIG  # This imports your MySQL configuration

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
SELECT h.zipcode, h.cd, h.state, h.city, h.state_fips_code, s.name, s.abbreviation
FROM hud_zip_crosswalk h
JOIN upac_states s ON TRIM(UPPER(h.state)) = TRIM(UPPER(s.abbreviation))
ORDER BY h.zipcode;
"""
cursor.execute(query)
rows = cursor.fetchall()

# --- Step 3: Generate the JSON Mapping ---
data = {}
for row in rows:
    # Unpack row:
    # h.zipcode, h.cd, h.state (abbreviation from h, but we'll ignore it), h.city, h.state_fips_code, s.name (full state name), s.abbreviation
    zipcode, cd, state_abbr_from_h, city, state_fips_code, state_full, s_abbr = row
    
    # Process the cd field: extract the last two digits as the district id.
    district_raw = cd[-2:]
    district_id = district_raw  # No conversion—use "00" for at-large
    
    # Build the JSON record with consistent field names.
    data[zipcode] = {
        "zipcode": zipcode,
        "cd": cd,
        "state": state_full,                # Full state name
        "state_abbreviation": s_abbr,         # Consistent field name for abbreviation
        "city": city,
        "district_id": district_id,           # Renamed field ("district" -> "district_id")
        "state_fips_code": state_fips_code
    }

cursor.close()
conn.close()

# --- Step 4: Write the JSON Data to a File ---
output_file = "hudzip.json"
with open(output_file, "w") as f:
    json.dump(data, f, indent=2)

print(f"HUD ZIP JSON generated successfully at: {output_file}")
