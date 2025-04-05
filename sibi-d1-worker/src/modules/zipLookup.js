export async function lookupZip(zip, db) {
  const zipQuery = await db.prepare(
    `SELECT state_fips_code, cd FROM hud_zip_crosswalk WHERE zipcode = ?`
  ).bind(zip).all();

  if (zipQuery.results.length === 0) {
    throw new Error("ZIP code not found in database.");
  }

  // Filter explicitly by state prefix matching
  const correctedEntries = zipQuery.results.filter(entry => 
    entry.cd.substring(0, 2) === entry.state_fips_code
  );

  if (correctedEntries.length === 0) {
    throw new Error(`No valid district found for ZIP ${zip} after filtering.`);
  }

  const stateFips = correctedEntries[0].state_fips_code;

  const districts = correctedEntries.map(entry => formatCongressionalDistrict(entry.cd));

  const uniqueDistricts = Array.from(new Set(districts));

  return {
    stateFips,
    districts: uniqueDistricts,
    multiDistrict: uniqueDistricts.length > 1
  };
}

// Helper function remains correct
function formatCongressionalDistrict(fullCd) {
  if (!fullCd || fullCd.length !== 4 || !/^\d{4}$/.test(fullCd)) {
    throw new Error(`Invalid congressional district code: "${fullCd}"`);
  }
  const districtCode = fullCd.substring(2);
  return districtCode === '00' ? 0 : parseInt(districtCode, 10);
}
