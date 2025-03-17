-- Drop tables if they exist (for clean re-creation)
DROP TABLE IF EXISTS hud_zip_crosswalk;
DROP TABLE IF EXISTS upac_states;
DROP TABLE IF EXISTS upac_representatives;
DROP TABLE IF EXISTS upac_locations;

-- Create upac_locations table (SQLite compatible)
CREATE TABLE upac_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,  -- e.g., "country"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    congressional_cycle INTEGER
);

-- Create upac_states table (SQLite compatible)
CREATE TABLE upac_states (
    name TEXT NOT NULL,
    abbreviation CHAR(2) NOT NULL,
    fips_state_code CHAR(2) NOT NULL,
    location_id INTEGER,
    type TEXT CHECK ( type IN ('state', 'federal district', 'territory') ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (fips_state_code),
    FOREIGN KEY (location_id) REFERENCES upac_locations(id)
);

-- Create hud_zip_crosswalk table (SQLite compatible)
CREATE TABLE hud_zip_crosswalk (
    zipcode TEXT,
    cd TEXT,
    state TEXT,
    city TEXT,
    state_fips_code TEXT,
    PRIMARY KEY (zipcode, cd)
);

-- Create upac_representatives table (SQLite compatible)
CREATE TABLE upac_representatives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    party CHAR(1),
    phone TEXT,
    committee_assignments TEXT,
    website TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    district_id TEXT
);

-- Insert sample data into upac_locations (one location record)
INSERT INTO upac_locations (id, name, type, created_at, congressional_cycle) VALUES 
(1, 'USA', 'country', '2025-03-04 18:45:58', 119);

-- Insert sample data into upac_states (three states)
INSERT INTO upac_states (name, abbreviation, fips_state_code, location_id, type, created_at) VALUES 
('California', 'CA', '06', 1, 'state', '2025-03-04 18:51:04'),
('Texas', 'TX', '48', 1, 'state', '2025-03-04 18:51:04'),
('Wyoming', 'WY', '56', 1, 'state', '2025-03-04 18:51:04');

-- Insert sample data into hud_zip_crosswalk (three records, one per state)
INSERT INTO hud_zip_crosswalk (zipcode, cd, state, city, state_fips_code) VALUES 
('90001', '01', 'CA', 'Los Angeles', '06'),
('73301', '00', 'TX', 'Austin', '48'),
('82601', '00', 'WY', 'Casper', '56');

-- Insert sample data into upac_representatives (three records, one per state)
INSERT INTO upac_representatives (name, state, party, phone, committee_assignments, website, created_at, district_id) VALUES 
('Doe, Jane', 'California', 'D', '(555)111-2222', 'Appropriations', 'https://example.com/jane', '2025-03-13 09:53:06', '01'),
('Smith, John', 'Texas', 'R', '(555)333-4444', 'Judiciary', 'https://example.com/john', '2025-03-13 09:53:06', 'At Large'),
('Brown, Charlie', 'Wyoming', 'R', '(555)777-8888', 'Energy|Infrastructure', 'https://example.com/charlie', '2025-03-13 09:53:06', 'At Large');
