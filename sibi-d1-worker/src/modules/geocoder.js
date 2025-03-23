export async function fetchGeography(lat, lon) {
  const censusUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lon}&y=${lat}&benchmark=2020&vintage=2020&format=json`;
  console.log("Fetching Census data from URL:", censusUrl);
  
  const response = await fetch(censusUrl);
  if (!response.ok) {
    throw new Error("Error calling Census Geocoder");
  }
  
  // Parse the JSON response.
  const data = await response.json();
  console.log("Full Census response:", JSON.stringify(data, null, 2));
  
  // Retrieve Census Blocks array and select the first block.
  const blocks = data?.result?.geographies?.["Census Blocks"];
  if (!blocks || blocks.length === 0) {
    throw new Error("No Census Block info found for these coordinates.");
  }
  const block = blocks[0];
  console.log("Using Census Block:", JSON.stringify(block, null, 2));
  
  // Extract state FIPS from block.
  let stateFips = block.STATE;
  if (!stateFips) {
    // Fallback: try to get stateFips from the "States" array.
    const statesArr = data?.result?.geographies?.States;
    console.log("States array from Census data:", JSON.stringify(statesArr, null, 2));
    const fallbackStateFips = statesArr?.[0]?.STATE || statesArr?.[0]?.GEOID;
    console.log("Fallback stateFips:", fallbackStateFips);
    if (!fallbackStateFips) {
      throw new Error("State FIPS not found in Census data.");
    }
    stateFips = fallbackStateFips;
  }
  
  // Attempt to extract congressional district information:
  let district;
  
  // First, try to use the 118th Congressional District data.
  const cd118Array = data?.result?.geographies?.["118th Congressional Districts"];
  if (cd118Array && cd118Array.length > 0) {
    district = cd118Array[0].CD118;
    console.log("Using 118th Congressional Districts:", district);
  } else {
    // Next, fallback to the 116th Congressional District data.
    const cd116Array = data?.result?.geographies?.["116th Congressional Districts"];
    if (cd116Array && cd116Array.length > 0) {
      district = cd116Array[0].CD116;
      console.log("118th Congressional District data not found. Using 116th Congressional District data instead:", district);
    } else if (Object.prototype.hasOwnProperty.call(block, "CD") && block.CD != null) {
      // As an additional fallback, check if the block itself has a "CD" property.
      district = block.CD;
      console.log("Block.CD property found, using district:", district);
    } else {
      throw new Error("No congressional district data found in Census response.");
    }
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
  
  console.log("Final extracted values from Census:", { stateFips, district });
  return { stateFips, district };
}
