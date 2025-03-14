import json
import os
import datetime
import tempfile
import runpy
import pytest
import sys

# Ensure the project root is in sys.path so we can import modules from the data folder.
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Dummy data simulating rows from the joined query
dummy_rows = [
    # (id, name, state, district_id, party, phone, committee_assignments, website, created_at, abbr)
    (1, "Adams, Alma", "North Carolina", "12", "D", "(202) 225-1510", "Agriculture|Education and Workforce", "https://adams.house.gov/", datetime.datetime(2025, 3, 13, 9, 53, 6), "NC"),
    (2, "Aderholt, Robert", "Alabama", "04", "R", "(202) 225-4876", "Appropriations", "https://aderholt.house.gov/", datetime.datetime(2025, 3, 13, 9, 53, 6), "AL"),
    (3, "Aguilar, Pete", "California", "33", "D", "(202) 225-3201", "Appropriations", "https://aguilar.house.gov/", datetime.datetime(2025, 3, 13, 9, 53, 6), "CA"),
]

# Create dummy cursor and connection classes
class DummyCursor:
    def execute(self, query):
        pass

    def fetchall(self):
        return dummy_rows

    def close(self):
        pass

class DummyConnection:
    def cursor(self):
        return DummyCursor()
    def close(self):
        pass

# Dummy connect function to override mysql.connector.connect
def dummy_connect(**kwargs):
    return DummyConnection()

def test_convert_rep_json(monkeypatch, tmp_path):
    # Import mysql.connector from the perspective of the convert_rep_json module.
    import mysql.connector
    # Monkey-patch the connect function so it returns our dummy connection.
    monkeypatch.setattr(mysql.connector, "connect", dummy_connect)
    
    # Change working directory to a temporary path so the JSON file is created there.
    old_cwd = os.getcwd()
    os.chdir(tmp_path)
    try:
        # Run the conversion script as __main__ using runpy.
        # Note: Use "data.convert_rep_json" because the script is now in the data folder.
        runpy.run_module("data.convert_rep_json", run_name="__main__")
        
        # The script writes "upac_representatives.json" in the current working directory.
        output_file = tmp_path / "upac_representatives.json"
        assert output_file.exists(), "The JSON output file was not created."
        
        # Load the file back and perform assertions.
        with open(output_file, "r") as f:
            data = json.load(f)
        
        # Expect composite keys like "NC-12", "AL-04", "CA-33".
        assert "NC-12" in data, "Missing key for North Carolina district 12."
        assert data["NC-12"]["name"] == "Adams, Alma", "Incorrect data for NC-12."
        assert "AL-04" in data, "Missing key for Alabama district 04."
        assert data["AL-04"]["name"] == "Aderholt, Robert", "Incorrect data for AL-04."
        assert "CA-33" in data, "Missing key for California district 33."
        assert data["CA-33"]["name"] == "Aguilar, Pete", "Incorrect data for CA-33."
    finally:
        os.chdir(old_cwd)
