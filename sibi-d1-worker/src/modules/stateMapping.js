export async function getStateName(stateFips, db) {
  console.log("Querying upac_states with stateFips:", stateFips);

  // 👇 Normalize: always 2-character string
  const paddedFips = stateFips.toString().padStart(2, "0");

  const stateQuery = await db.prepare(
    `SELECT name FROM upac_states WHERE fips_state_code = ?`
  ).bind(paddedFips).all();

  if (stateQuery.results.length === 0) throw new Error("State not found");

  const stateName = stateQuery.results[0].name;
  console.log("Mapped stateFips", paddedFips, "to stateName:", stateName);
  return stateName;
}
