import os
import json

def index_hudzip_data():
    # Determine the absolute path of this script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Assume the project root is one level up from the scripts folder
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    # The data folder is in the project root
    data_dir = os.path.join(project_root, "data")
    
    # Define the input and output file paths
    input_file = os.path.join(data_dir, "hudzip.json")
    output_file = os.path.join(data_dir, "index_hudzip_data.json")
    
    # Load the original hudzip.json data
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    # Create an index grouped by state_abbreviation
    index = {}
    for zip_code, record in data.items():
        state_abbr = record.get("state_abbreviation")
        if not state_abbr:
            print(f"Warning: No state_abbreviation for ZIP {zip_code}; skipping.")
            continue
        if state_abbr not in index:
            index[state_abbr] = {}
        index[state_abbr][zip_code] = record
    
    # Write the indexed data to index_hudzip_data.json
    with open(output_file, 'w') as f:
        json.dump(index, f, indent=2)
    
    print(f"Indexed hudzip data saved to {output_file}")

if __name__ == "__main__":
    index_hudzip_data()
