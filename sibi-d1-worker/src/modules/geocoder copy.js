#!/usr/bin/env node
// geotest.js

export async function fetchGeography(lat, lon) {
  const censusUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lon}&y=${lat}&benchmark=2020&vintage=2020&format=json`;
  console.log("Fetching Census data from URL:", censusUrl);
  
  const response = await fetch(censusUrl);
  if (!response.ok) {
    throw new Error("Error calling Census Geocoder");
  }
  
  // Log the entire response object for inspection.
  const data = await response.json();
  console.log("Full Census response:", JSON.stringify(data, null, 2));
  
  // Retrieve Census Blocks array and select the first block.
  const blocks = data?.result?.geographies?.["Census Blocks"];
  if (!blocks || blocks.length === 0) {
    throw new Error("No Census Block info found for these coordinates.");
  }
  const block = blocks[0];
  console.log("Using Census Block:", JSON.stringify(block, null, 2));
  
  const stateFips = block.STATE;
  if (!stateFips) {
    // Fallback: try to get stateFips from the "States" array.
    const statesArr = data?.result?.geographies?.States;
    console.log("States array from Census data:", JSON.stringify(statesArr, null, 2));
    const fallbackStateFips = statesArr?.[0]?.STATE || statesArr?.[0]?.GEOID;
    console.log("Fallback stateFips:", fallbackStateFips);
    if (!fallbackStateFips) {
      throw new Error("State FIPS not found in Census data.");
    }
  }
  
  // Explicitly check if block has its own "CD" property.
  let district;
  if (Object.prototype.hasOwnProperty.call(block, "CD") && block.CD != null) {
    district = block.CD;
    console.log("District extracted from block:", district);
  } else {
    const cd116Array = data?.result?.geographies?.["116th Congressional Districts"];
    console.log("116th Congressional Districts array:", JSON.stringify(cd116Array, null, 2));
    district = cd116Array?.[0]?.CD116;
    console.log("Block.CD is missing. Fallback district from 116th Congressional Districts:", district);
  }
  
  // Normalize the district: if district is 0, "0", or "At Large" (case-insensitive), convert it to "00".
  if (
    district === 0 ||
    district === "0" ||
    (typeof district === "string" && district.trim().toLowerCase() === "at large")
  ) {
    district = "00";
    console.log("Normalized district to '00' for an at-large district");
  }
  
  if (!district) {
    throw new Error("District not found in Census data.");
  }
  
  console.log("Final extracted values from Census:", { stateFips: block.STATE, district });
  return { stateFips: block.STATE, district };
}

// If the file is run directly from the command line, process arguments.
if (import.meta.url === process.argv[1]) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node geotest.js <lat> <lon>");
    process.exit(1);
  }
  const [lat, lon] = args;
  fetchGeography(lat, lon)
    .then(result => console.log("Extracted Geolocation Data:", result))
    .catch(error => console.error("Error:", error));
}
