CREATE TABLE upac_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,  -- e.g., "country"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    congressional_cycle INTEGER
);
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
CREATE TABLE hud_zip_crosswalk (
    zipcode TEXT,
    cd TEXT,
    state TEXT,
    city TEXT,
    state_fips_code TEXT,
    PRIMARY KEY (zipcode, cd)
);
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
