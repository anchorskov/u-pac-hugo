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

export function isAtLargeDistrict(termDistrict, queryDistrict) {
  if (queryDistrict === "At Large") {
    return termDistrict === "At Large" || termDistrict === 0 || termDistrict === "0";
  }
  const termNum = parseInt(termDistrict, 10);
  const queryNum = parseInt(queryDistrict, 10);
  return termNum === queryNum;
}

export async function getStateAbbrev(stateName, db) {
  const stateQuery = await db.prepare(
    `SELECT abbreviation FROM upac_states WHERE name = ?`
  ).bind(stateName).all();
  if (stateQuery.results.length === 0) {
    throw new Error("State abbreviation not found for " + stateName);
  }
  return stateQuery.results[0].abbreviation;
}

export async function filterLegislators(stateName, district, kvData, db) {
  console.log("🧪 filterLegislators → state:", stateName, "| district:", district);
  console.log("🧪 typeof kvData:", typeof kvData);
  if (typeof kvData === "string") {
    console.log("🧪 kvData (start):", kvData.slice(0, 100), "...");
  }

  let legislators;
  try {
    legislators = typeof kvData === "string" ? JSON.parse(kvData) : kvData;
  } catch (e) {
    console.error("🔥 Error parsing legislators KV JSON:", e);
    throw new Error("Error parsing legislators KV JSON");
  }

  const stateAbbrev = await getStateAbbrev(stateName, db);

  const representatives = legislators.filter((leg) => {
    const term = getActiveTerm(leg);
    if (!term || term.type !== "rep") return false;
    if (!term.state || term.state.toUpperCase() !== stateAbbrev.toUpperCase()) return false;
    if (!leg.id?.fec || !Array.isArray(leg.id.fec)) return false;
    const fecHouseMatch = leg.id.fec.some(code => code.startsWith("H"));
    if (!fecHouseMatch) return false;
    return isAtLargeDistrict(term.district, district);
  });

  const senators = legislators.filter((leg) => {
    const term = getActiveTerm(leg);
    return (
      term &&
      term.type === "sen" &&
      term.state?.toUpperCase() === stateAbbrev.toUpperCase()
    );
  });

  console.log(`🔍 Filtered legislators → Senators: ${senators.length}, Reps: ${representatives.length}`);
  return [...senators, ...representatives];
}
