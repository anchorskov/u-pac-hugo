#!/usr/bin/env python
# coding: utf-8

"""
convert_legislators.py

A simple script to convert legislators-current.yaml
from the congress-legislators repo into a JSON file
stored in sibi-d1-worker/data/legislators-current.json.
"""

import os
import yaml
import json

# Adjust these paths as needed:
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONGRESS_YAML = os.path.join(BASE_DIR, "congress-legislators", "legislators-current.yaml")
OUTPUT_JSON = os.path.join(BASE_DIR, "sibi-d1-worker", "data", "legislators-current.json")

def main():
    # Check that the YAML file exists
    if not os.path.exists(CONGRESS_YAML):
        print(f"Error: File not found: {CONGRESS_YAML}")
        return

    # Load the YAML
    with open(CONGRESS_YAML, "r") as yf:
        data = yaml.safe_load(yf)

    # Ensure the output directory exists
    output_dir = os.path.dirname(OUTPUT_JSON)
    if not os.path.isdir(output_dir):
        os.makedirs(output_dir)

    # Write to JSON
    with open(OUTPUT_JSON, "w", encoding="utf-8") as jf:
        json.dump(data, jf, indent=2, ensure_ascii=False)

    print(f"Successfully wrote JSON to {OUTPUT_JSON}")

if __name__ == "__main__":
    main()
