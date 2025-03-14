-- Adminer 4.8.3 MySQL 8.0.16 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS `ctunhj0f_u-pac`;
CREATE DATABASE `ctunhj0f_u-pac` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ctunhj0f_u-pac`;

DROP TABLE IF EXISTS `hud_zip_crosswalk`;
CREATE TABLE `hud_zip_crosswalk` (
  `zipcode` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ZIP code associated with the congressional district (remove "" when displaying)',
  `cd` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Congressional district code (remove "" when displaying)',
  `state` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'State abbreviation (remove "" when displaying)',
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'City name associated with the ZIP code (remove "" when displaying)',
  `state_fips_code` char(2) COLLATE utf8mb4_unicode_ci GENERATED ALWAYS AS ((case replace(`state`,_utf8mb4'"',_utf8mb4'') when _utf8mb4'AL' then _utf8mb4'01' when _utf8mb4'AK' then _utf8mb4'02' when _utf8mb4'AZ' then _utf8mb4'04' when _utf8mb4'AR' then _utf8mb4'05' when _utf8mb4'CA' then _utf8mb4'06' when _utf8mb4'CO' then _utf8mb4'08' when _utf8mb4'CT' then _utf8mb4'09' when _utf8mb4'DE' then _utf8mb4'10' when _utf8mb4'DC' then _utf8mb4'11' when _utf8mb4'FL' then _utf8mb4'12' when _utf8mb4'GA' then _utf8mb4'13' when _utf8mb4'HI' then _utf8mb4'15' when _utf8mb4'ID' then _utf8mb4'16' when _utf8mb4'IL' then _utf8mb4'17' when _utf8mb4'IN' then _utf8mb4'18' when _utf8mb4'IA' then _utf8mb4'19' when _utf8mb4'KS' then _utf8mb4'20' when _utf8mb4'KY' then _utf8mb4'21' when _utf8mb4'LA' then _utf8mb4'22' when _utf8mb4'ME' then _utf8mb4'23' when _utf8mb4'MD' then _utf8mb4'24' when _utf8mb4'MA' then _utf8mb4'25' when _utf8mb4'MI' then _utf8mb4'26' when _utf8mb4'MN' then _utf8mb4'27' when _utf8mb4'MS' then _utf8mb4'28' when _utf8mb4'MO' then _utf8mb4'29' when _utf8mb4'MT' then _utf8mb4'30' when _utf8mb4'NE' then _utf8mb4'31' when _utf8mb4'NV' then _utf8mb4'32' when _utf8mb4'NH' then _utf8mb4'33' when _utf8mb4'NJ' then _utf8mb4'34' when _utf8mb4'NM' then _utf8mb4'35' when _utf8mb4'NY' then _utf8mb4'36' when _utf8mb4'NC' then _utf8mb4'37' when _utf8mb4'ND' then _utf8mb4'38' when _utf8mb4'OH' then _utf8mb4'39' when _utf8mb4'OK' then _utf8mb4'40' when _utf8mb4'OR' then _utf8mb4'41' when _utf8mb4'PA' then _utf8mb4'42' when _utf8mb4'RI' then _utf8mb4'44' when _utf8mb4'SC' then _utf8mb4'45' when _utf8mb4'SD' then _utf8mb4'46' when _utf8mb4'TN' then _utf8mb4'47' when _utf8mb4'TX' then _utf8mb4'48' when _utf8mb4'UT' then _utf8mb4'49' when _utf8mb4'VT' then _utf8mb4'50' when _utf8mb4'VA' then _utf8mb4'51' when _utf8mb4'WA' then _utf8mb4'53' when _utf8mb4'WV' then _utf8mb4'54' when _utf8mb4'WI' then _utf8mb4'55' when _utf8mb4'WY' then _utf8mb4'56' when _utf8mb4'PR' then _utf8mb4'72' when _utf8mb4'VI' then _utf8mb4'78' when _utf8mb4'GU' then _utf8mb4'66' when _utf8mb4'MP' then _utf8mb4'69' else NULL end)) STORED COMMENT 'Computed FIPS state code (quotes removed automatically)',
  PRIMARY KEY (`zipcode`,`cd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='HUD ZIP to congressional district crosswalk table storing raw ZIP, district, state, and city data.';


DROP TABLE IF EXISTS `upac_candidates`;
CREATE TABLE `upac_candidates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `party` enum('Democrat','Republican','Independent','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `election_year` year(4) NOT NULL,
  `is_national` tinyint(1) DEFAULT '0',
  `is_state` tinyint(1) DEFAULT '0',
  `is_local` tinyint(1) DEFAULT '0',
  `county_id` int(11) DEFAULT NULL,
  `city_ward_id` int(11) DEFAULT NULL,
  `state_district_id` int(11) DEFAULT NULL,
  `district_id` int(11) DEFAULT NULL,
  `incumbent` tinyint(1) NOT NULL DEFAULT '0',
  `bio` text COLLATE utf8mb4_unicode_ci,
  `website` varchar(2083) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` varchar(2083) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `integrity_meter` tinyint(4) NOT NULL,
  `accountability_meter` tinyint(4) NOT NULL,
  `compassion_meter` tinyint(4) NOT NULL,
  `transparency_meter` tinyint(4) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fips_state_code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `upac_candidates_ibfk_2` (`county_id`),
  KEY `upac_candidates_ibfk_3` (`city_ward_id`),
  KEY `upac_candidates_ibfk_4` (`state_district_id`),
  CONSTRAINT `upac_candidates_ibfk_2` FOREIGN KEY (`county_id`) REFERENCES `upac_counties` (`id`) ON DELETE SET NULL,
  CONSTRAINT `upac_candidates_ibfk_3` FOREIGN KEY (`city_ward_id`) REFERENCES `upac_city_wards` (`id`) ON DELETE SET NULL,
  CONSTRAINT `upac_candidates_ibfk_4` FOREIGN KEY (`state_district_id`) REFERENCES `upac_state_districts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `upac_candidates_chk_1` CHECK ((`integrity_meter` between 0 and 100)),
  CONSTRAINT `upac_candidates_chk_2` CHECK ((`accountability_meter` between 0 and 100)),
  CONSTRAINT `upac_candidates_chk_3` CHECK ((`compassion_meter` between 0 and 100)),
  CONSTRAINT `upac_candidates_chk_4` CHECK ((`transparency_meter` between 0 and 100)),
  CONSTRAINT `upac_candidates_chk_5` CHECK ((((`is_national` + `is_state`) + `is_local`) = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `upac_centroid_vectors`;
CREATE TABLE `upac_centroid_vectors` (
  `vector_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for each centroid-to-boundary vector',
  `district_id` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The congressional district this vector belongs to',
  `edge_lat` decimal(10,8) NOT NULL COMMENT 'Latitude coordinate of a boundary point in the congressional district',
  `edge_lon` decimal(10,8) NOT NULL COMMENT 'Longitude coordinate of a boundary point in the congressional district',
  `magnitude` decimal(12,8) NOT NULL COMMENT 'Precomputed distance from the centroid to this boundary point',
  `direction` decimal(12,8) NOT NULL COMMENT 'Precomputed angle (bearing) from the centroid to this boundary point',
  PRIMARY KEY (`vector_id`),
  KEY `district_id` (`district_id`) COMMENT 'Index for fast lookup of vectors by district',
  KEY `direction` (`direction`) COMMENT 'Index for quick vector angle comparisons',
  CONSTRAINT `upac_centroid_vectors_ibfk_1` FOREIGN KEY (`district_id`) REFERENCES `upac_congressional_centroids` (`district_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores precomputed vectors from district centroids to boundary points, allowing fast spatial lookups.';


DROP TABLE IF EXISTS `upac_cities`;
CREATE TABLE `upac_cities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Full name of the city',
  `county_id` int(11) NOT NULL COMMENT 'Foreign key reference to upac_counties',
  `ansicode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique ANSI code for the city',
  `latitude` decimal(9,6) DEFAULT NULL COMMENT 'Latitude of the city centroid',
  `longitude` decimal(9,6) DEFAULT NULL COMMENT 'Longitude of the city centroid',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ansicode` (`ansicode`),
  KEY `upac_cities_ibfk_1` (`county_id`),
  CONSTRAINT `upac_cities_ibfk_1` FOREIGN KEY (`county_id`) REFERENCES `upac_counties` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores city-level geographic and administrative information';


DROP TABLE IF EXISTS `upac_city_wards`;
CREATE TABLE `upac_city_wards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `city_id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward_number` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `upac_city_wards_ibfk_1` (`city_id`),
  CONSTRAINT `upac_city_wards_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `upac_cities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `upac_congress_cycles`;
CREATE TABLE `upac_congress_cycles` (
  `congress_number` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `current_cycle` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`congress_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `upac_congressional_blobs`;
CREATE TABLE `upac_congressional_blobs` (
  `geoid` char(5) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique Congressional District Identifier (State FIPS + District Number)',
  `state_fips` char(2) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'State FIPS code - 2-digit Federal Information Processing Standards code',
  `district_id` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `geojson` geometry NOT NULL COMMENT 'Polygon data for congressional district boundary (stored as GEOMETRY)',
  `centroid_lat` decimal(9,6) NOT NULL COMMENT 'Approximate centroid latitude for district (used for quick filtering)',
  `centroid_lon` decimal(9,6) NOT NULL COMMENT 'Approximate centroid longitude for district (used for quick filtering)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp for tracking updates',
  PRIMARY KEY (`geoid`),
  SPATIAL KEY `geojson` (`geojson`),
  KEY `idx_centroid` (`centroid_lat`,`centroid_lon`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores congressional district polygon data for spatial lookups.';


DROP TABLE IF EXISTS `upac_congressional_centroids`;
CREATE TABLE `upac_congressional_centroids` (
  `district_id` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique identifier for the congressional district (e.g., 5600 for Wyoming At-Large)',
  `centroid_lat` decimal(10,8) NOT NULL COMMENT 'Latitude coordinate of the congressional district centroid',
  `centroid_lon` decimal(10,8) NOT NULL COMMENT 'Longitude coordinate of the congressional district centroid',
  PRIMARY KEY (`district_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores the centroid coordinates of each congressional district for fast lookup.';


DROP TABLE IF EXISTS `upac_counties`;
CREATE TABLE `upac_counties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Full name of the county',
  `fips_code` char(5) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique county FIPS code (State FIPS + County FIPS)',
  `latitude` decimal(9,6) DEFAULT NULL COMMENT 'Latitude of the county centroid',
  `longitude` decimal(9,6) DEFAULT NULL COMMENT 'Longitude of the county centroid',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `fips_state_code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'State FIPS code reference',
  PRIMARY KEY (`id`),
  UNIQUE KEY `fips_code` (`fips_code`),
  KEY `upac_counties_fk_state` (`fips_state_code`),
  CONSTRAINT `upac_counties_fk_state` FOREIGN KEY (`fips_state_code`) REFERENCES `upac_states` (`fips_state_code`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores county-level geographic and administrative information.';


DROP TABLE IF EXISTS `upac_district_mappings`;
CREATE TABLE `upac_district_mappings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `district_id_blobs` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'District ID as stored in upac_congressional_blobs',
  `district_id_representatives` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'District ID as stored in upac_representatives',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Text description (e.g., Delegate, At Large)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `district_id_blobs` (`district_id_blobs`,`district_id_representatives`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Maps congressional district IDs between blobs and representatives.';


DROP TABLE IF EXISTS `upac_locations`;
CREATE TABLE `upac_locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('country') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `congressional_cycle` int(11) NOT NULL DEFAULT '119',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_location_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `upac_multi_district_zips`;
CREATE TABLE `upac_multi_district_zips` (
  `zipcode` char(5) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '5-digit ZIP code',
  `congressionaldistricts` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `upac_queries`;
CREATE TABLE `upac_queries` (
  `query_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the stored query',
  `query_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Descriptive name of the query',
  `query_text` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The SQL query itself',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp for when the query was added',
  PRIMARY KEY (`query_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores important queries for easy reference and execution.';


DROP TABLE IF EXISTS `upac_representatives`;
CREATE TABLE `upac_representatives` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Full name of the representative',
  `state_fips` char(2) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'State FIPS code',
  `district_id` char(25) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Congressional District number',
  `party` enum('Democrat','Republican','Independent','Other') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Political affiliation',
  `incumbent` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 if currently in office, 0 otherwise',
  `election_year` year(4) NOT NULL COMMENT 'Year of last election win',
  `term_start` date NOT NULL COMMENT 'Date when current term started',
  `term_end` date DEFAULT NULL COMMENT 'Date when term ends, NULL if ongoing',
  `contact_website` varchar(2083) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Official contact or website URL',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Official elected U.S. Representatives by state and district.';


DROP TABLE IF EXISTS `upac_state_districts`;
CREATE TABLE `upac_state_districts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district_number` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fips_state_code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'State FIPS code reference',
  PRIMARY KEY (`id`),
  KEY `upac_state_districts_fk_state` (`fips_state_code`),
  CONSTRAINT `upac_state_districts_fk_state` FOREIGN KEY (`fips_state_code`) REFERENCES `upac_states` (`fips_state_code`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `upac_states`;
CREATE TABLE `upac_states` (
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Full name of the state or territory',
  `abbreviation` char(2) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Two-letter USPS abbreviation',
  `fips_state_code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Numeric FIPS code uniquely identifying each state or territory',
  `location_id` int(11) NOT NULL COMMENT 'Reference to upac_locations (Geographic classification)',
  `type` enum('state','federal district','territory') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'State type classification',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  PRIMARY KEY (`fips_state_code`),
  UNIQUE KEY `abbreviation` (`abbreviation`),
  UNIQUE KEY `fips_state_code` (`fips_state_code`),
  KEY `upac_states_ibfk_1` (`location_id`),
  CONSTRAINT `upac_states_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `upac_locations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores information about U.S. states, territories, and the federal district.';


DROP TABLE IF EXISTS `upac_users_upac`;
CREATE TABLE `upac_users_upac` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','volunteer') COLLATE utf8mb4_unicode_ci DEFAULT 'volunteer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `upac_zip_congressional`;
CREATE TABLE `upac_zip_congressional` (
  `zipcode` char(5) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '5-digit ZIP code',
  `fips_state_code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'State FIPS code (converted from HUD state)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `multi_district` tinyint(1) DEFAULT '0' COMMENT 'Indicates if the ZIP spans multiple districts',
  `congressionaldistricts` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Represents unique congressional district assignments for each ZIP code.',
  `comments` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes about multi-state ZIP handling and assumptions.',
  `multi_state` tinyint(1) DEFAULT '0' COMMENT '1 if ZIP crosses multiple states',
  `latitude` decimal(9,6) DEFAULT NULL COMMENT 'Latitude of the ZIP centroid',
  `longitude` decimal(9,6) DEFAULT NULL COMMENT 'Longitude of the ZIP centroid',
  PRIMARY KEY (`zipcode`,`congressionaldistricts`),
  KEY `upac_zip_congressional_fk_state` (`fips_state_code`),
  KEY `idx_zip_latlon` (`latitude`,`longitude`),
  CONSTRAINT `upac_zip_congressional_fk_state` FOREIGN KEY (`fips_state_code`) REFERENCES `upac_states` (`fips_state_code`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Maps ZIP codes to their congressional districts, optionally linking to counties.';


-- 2025-03-06 04:44:00
