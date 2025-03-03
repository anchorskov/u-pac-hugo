USE upac;
-- Use U-PAC Database
USE upac;

-- Locations Table
CREATE TABLE upac_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('country') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- States Table
CREATE TABLE upac_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    abbreviation CHAR(2) UNIQUE NOT NULL,
    fips_code CHAR(2) UNIQUE NOT NULL,
    location_id INT NOT NULL,
    type ENUM('state', 'federal district', 'territory') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES upac_locations(id)
);

-- Counties Table
CREATE TABLE upac_counties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state_id INT NOT NULL,
    fips_code CHAR(5) UNIQUE NOT NULL,
    latitude DECIMAL(9,6) DEFAULT NULL,
    longitude DECIMAL(9,6) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES upac_states(id)
);

-- Cities Table
CREATE TABLE upac_cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    county_id INT NOT NULL,
    latitude DECIMAL(9,6) DEFAULT NULL,
    longitude DECIMAL(9,6) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (county_id) REFERENCES upac_counties(id)
);

-- City Wards Table
CREATE TABLE upac_city_wards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    ward_number VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES upac_cities(id)
);

-- Congressional Districts Table
CREATE TABLE upac_congressionaldistricts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district_number VARCHAR(10) NOT NULL,
    state_id INT NOT NULL,
    latitude DECIMAL(9,6) DEFAULT NULL,
    longitude DECIMAL(9,6) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES upac_states(id)
);

-- State Districts Table
CREATE TABLE upac_state_districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district_number VARCHAR(10) NOT NULL,
    state_id INT NOT NULL,
    latitude DECIMAL(9,6) DEFAULT NULL,
    longitude DECIMAL(9,6) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES upac_states(id)
);

-- Candidates Table
CREATE TABLE upac_candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    party ENUM('Democrat', 'Republican', 'Independent', 'Other') NOT NULL,
    election_year YEAR NOT NULL,
    is_national BOOLEAN DEFAULT FALSE,
    is_state BOOLEAN DEFAULT FALSE,
    is_local BOOLEAN DEFAULT FALSE,
    state_id INT DEFAULT NULL,
    county_id INT DEFAULT NULL,
    city_ward_id INT DEFAULT NULL,
    state_district_id INT DEFAULT NULL,
    district_id INT DEFAULT NULL,
    incumbent TINYINT(1) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    website VARCHAR(2083) DEFAULT NULL,
    photo_url VARCHAR(2083) DEFAULT NULL,
    integrity_meter TINYINT NOT NULL CHECK (integrity_meter BETWEEN 0 AND 100),
    accountability_meter TINYINT NOT NULL CHECK (accountability_meter BETWEEN 0 AND 100),
    compassion_meter TINYINT NOT NULL CHECK (compassion_meter BETWEEN 0 AND 100),
    transparency_meter TINYINT NOT NULL CHECK (transparency_meter BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES upac_states(id) ON DELETE SET NULL,
    FOREIGN KEY (county_id) REFERENCES upac_counties(id) ON DELETE SET NULL,
    FOREIGN KEY (city_ward_id) REFERENCES upac_city_wards(id) ON DELETE SET NULL,
    FOREIGN KEY (state_district_id) REFERENCES upac_state_districts(id) ON DELETE SET NULL,
    CHECK ((is_national + is_state + is_local) = 1)
);

-- Users Table
CREATE TABLE upac_users_upac (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'volunteer') DEFAULT 'volunteer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
