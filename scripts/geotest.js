#!/usr/bin/env node

async function fetchCensusData(lat, lon) {
  const censusUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lon}&y=${lat}&benchmark=2020&vintage=2020&format=json`;
  console.log("Fetching Census data from URL:", censusUrl);

  const response = await fetch(censusUrl);
  if (!response.ok) {
    throw new Error("Error calling Census Geocoder");
  }

  // Parse the JSON response.
  const data = await response.json();
  console.log("Full Census response:", JSON.stringify(data, null, 2));

  // Retrieve the Census Blocks array and select the first block.
  const blocks = data?.result?.geographies?.["Census Blocks"];
  if (!blocks || blocks.length === 0) {
    throw new Error("No Census Block info found for these coordinates.");
  }
  const block = blocks[0];
  console.log("Using Census Block:", JSON.stringify(block, null, 2));

  // Extract state FIPS from the block.
  const stateFips = block.STATE;
  if (!stateFips) {
    // Fallback: try to extract state FIPS from the "States" array.
    const statesArr = data?.result?.geographies?.States;
    console.log("States array from Census data:", JSON.stringify(statesArr, null, 2));
    const fallbackStateFips = statesArr?.[0]?.STATE || statesArr?.[0]?.GEOID;
    console.log("Fallback stateFips:", fallbackStateFips);
    if (!fallbackStateFips) {
      throw new Error("State FIPS not found in Census data.");
    }
  }

  // Attempt to extract the 118th Congressional District info.
  let district;
  const cd118Array = data?.result?.geographies?.["118th Congressional Districts"];
  if (cd118Array && cd118Array.length > 0) {
    district = cd118Array[0].CD118;
    console.log("Using 118th Congressional Districts:", district);
  } else {
    // Fallback: if 118th data is missing, use the 116th Congressional District data.
    const cd116Array = data?.result?.geographies?.["116th Congressional Districts"];
    if (cd116Array && cd116Array.length > 0) {
      district = cd116Array[0].CD116;
      console.log("118th Congressional District data not found. Using 116th Congressional District data instead:", district);
    } else {
      throw new Error("Neither 118th nor 116th Congressional District data found in the Census response.");
    }
  }

  // Normalize the district: if the value is 0, "0", or "At Large", convert it to "00".
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

// MAIN EXECUTION: Use sample coordinates.
(async () => {
  const lat = 38.8104192;
  const lon = -104.8346624;
  try {
    const geoData = await fetchCensusData(lat, lon);
    console.log("Extracted Geolocation Data:", geoData);
  } catch (error) {
    console.error("Error:", error);
  }
})();
