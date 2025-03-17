import csv

CSV_PATH = "/home/anchor/upac_states.csv"  # Where you saved the CSV
SQL_PATH = "/home/anchor/upac_states_data.sql"  # Output .sql file

with open(CSV_PATH, "r", encoding="utf-8") as fin, open(SQL_PATH, "w", encoding="utf-8") as fout:
    reader = csv.DictReader(fin)
    
    # We'll just build one big INSERT statement.
    fout.write("-- Insert rows into upac_states\n")
    fout.write("INSERT INTO upac_states (name, abbreviation, fips_state_code, location_id, type, created_at)\nVALUES\n")

    rows = []
    for row in reader:
        name = row['name'].replace("'", "''")
        abbr = row['abbreviation'].replace("'", "''")
        fips = row['fips_state_code'].replace("'", "''")
        locid = row['location_id']
        stype = row['type'].replace("'", "''")
        c_at = row.get('created_at', 'CURRENT_TIMESTAMP')
        
        # If you know created_at is always nonempty, remove the get() fallback
        # Also ensure location_id is numeric, else wrap it in quotes:
        row_sql = f"('{name}', '{abbr}', '{fips}', {locid}, '{stype}', '{c_at}')"
        rows.append(row_sql)

    fout.write(",\n".join(rows))
    fout.write(";\n")
