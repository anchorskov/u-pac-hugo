export async function getStateName(stateFips, db) {
    console.log("Querying upac_states with stateFips:", stateFips);
    const stateQuery = await db.prepare(
      `SELECT name FROM upac_states WHERE fips_state_code = ?`
    ).bind(stateFips).all();
    if (stateQuery.results.length === 0) throw new Error("State not found");
    const stateName = stateQuery.results[0].name;
    console.log("Mapped stateFips", stateFips, "to stateName:", stateName);
    return stateName;
  }
  