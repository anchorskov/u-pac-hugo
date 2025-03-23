// legislatorFilter.js

// Returns the currently active term based on the current date.
export function getActiveTerm(legislator) {
  const now = new Date();
  if (!legislator.terms || legislator.terms.length === 0) return null;
  return legislator.terms.find(term => {
    const start = new Date(term.start);
    const end = new Date(term.end);
    return start <= now && now <= end;
  });
}

// Retains the existing normalization for at-large districts.
export function isAtLargeDistrict(termDistrict, queryDistrict) {
  if (queryDistrict === "At Large") {
    return termDistrict === "At Large" || termDistrict === 0 || termDistrict === "0";
  }
  // Convert both to integers for a proper numeric comparison.
  const termNum = parseInt(termDistrict, 10);
  const queryNum = parseInt(queryDistrict, 10);
  return termNum === queryNum;
}

// Asynchronously retrieves the state abbreviation from the upac_states table in the D1 database.
export async function getStateAbbrev(stateName, db) {
  const stateQuery = await db.prepare(
    `SELECT abbreviation FROM upac_states WHERE name = ?`
  ).bind(stateName).all();
  if (stateQuery.results.length === 0) {
    throw new Error("State abbreviation not found for " + stateName);
  }
  return stateQuery.results[0].abbreviation;
}

// Filters legislators by using the active term, comparing state abbreviations, and an optional FEC code check.
// Note: This function now expects a 'db' parameter for looking up the state abbreviation.
export async function filterLegislators(stateName, district, kvData, db) {
  let legislators;
  try {
    legislators = JSON.parse(kvData);
  } catch (e) {
    throw new Error("Error parsing legislators KV JSON");
  }

  // Retrieve the state abbreviation from the database.
  const stateAbbrev = await getStateAbbrev(stateName, db);

  // Filter representatives: use the active term, check that the state's abbreviation matches,
  // and (optionally) confirm the FEC field indicates a House candidacy.
  const representatives = legislators.filter((leg) => {
    const term = getActiveTerm(leg);
    if (!term || term.type !== "rep") return false;
    if (term.state.toUpperCase() !== stateAbbrev.toUpperCase()) return false;
    const fecHouseMatch = leg.id.fec && leg.id.fec.some(code => code.startsWith("H"));
    if (!fecHouseMatch) return false;
    return isAtLargeDistrict(term.district, district);
  });

  // Filter senators using the active term and state abbreviation.
  const senators = legislators.filter((leg) => {
    const term = getActiveTerm(leg);
    if (!term || term.type !== "sen") return false;
    return term.state.toUpperCase() === stateAbbrev.toUpperCase();
  });

  console.log("Filtered legislators - senators:", senators.length, "representatives:", representatives.length);
  return [...senators, ...representatives];
}
