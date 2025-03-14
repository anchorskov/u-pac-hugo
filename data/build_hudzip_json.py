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
# This query joins hud_zip_crosswalk (alias "h") with upac_states (alias "s")
# using h.state (state abbreviation) equals s.abbreviation.
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
    # Unpack the row:
    # h.zipcode, h.cd, h.state (abbreviation), h.city, h.state_fips_code, s.name (full state name), s.abbreviation
    zipcode, cd, state_abbr, city, state_fips_code, state_full, s_abbr = row
    
    # Process the cd field: extract the last two digits as the congressional district.
    # If the last two digits are "00", designate it as "At-Large".
    district_raw = cd[-2:]
    district = "At-Large" if district_raw == "00" else district_raw
    
    # Build the JSON record. We key the object by the zipcode.
    data[zipcode] = {
        "zipcode": zipcode,
        "cd": cd,
        "state": state_full,           # Full state name from upac_states
        "abbreviation": s_abbr,        # State abbreviation
        "city": city,
        "district": district,
        "state_fips_code": state_fips_code
    }

cursor.close()
conn.close()

# --- Step 4: Write the JSON Data to a File ---
output_file = "hudzip.json"
with open(output_file, "w") as f:
    json.dump(data, f, indent=2)

print(f"HUD ZIP JSON generated successfully at: {output_file}")
