// addressLookup.js (robust version based on logs)
export async function fetchDistrictByAddress(street, city, state, zip) {
  const endpoint = `https://geocoding.geo.census.gov/geocoder/geographies/address?street=${encodeURIComponent(
    street
  )}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(
    state
  )}&zip=${encodeURIComponent(zip)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Census geolocation HTTP error: ${response.status}`);
  }

  const data = await response.json();

  const matches = data.result.addressMatches;
  if (!matches || matches.length === 0) {
    throw new Error("No matching addresses found in Census data.");
  }

  const geographies = matches[0]?.geographies;
  if (!geographies) {
    throw new Error("Geographies data missing in Census response.");
  }

  const stateGeo = geographies["States"]?.[0];
  if (!stateGeo || !stateGeo.STATE) {
    throw new Error("State FIPS information missing in Census response.");
  }

  const districtGeo =
    geographies["119th Congressional Districts"]?.[0] ||
    geographies["118th Congressional Districts"]?.[0] ||
    geographies["116th Congressional Districts"]?.[0];

  if (!districtGeo) {
    throw new Error("Congressional district information missing in Census response.");
  }

  const stateFips = stateGeo.STATE;
  let district = districtGeo.CD || districtGeo.CD116 || districtGeo.CD118;

  // Fallback for newer Census API format (from logs: use BASENAME if CD not available)
  if (!district && districtGeo.BASENAME) {
    district = districtGeo.BASENAME;
  }

  if (!stateFips || !district) {
    throw new Error("Incomplete state or district information in Census response.");
  }

  return { stateFips, district };
}
