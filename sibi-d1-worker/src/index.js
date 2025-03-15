export default {
	async fetch(request, env, ctx) {
	  // Log the entire environment (or its keys) to verify if the binding is present.
	  console.log("Environment keys:", Object.keys(env));
	  
	  // Check if the D1 binding is present
	  if (!env.SIBIDRIFT_DB) {
		return new Response("D1 binding is not available.", { status: 500 });
	  }
	  
	  // Proceed with your SQL query if available
	  const hudResult = await env.SIBIDRIFT_DB.prepare("SELECT * FROM hud_zip_crosswalk LIMIT 10").all();
	  const repResult = await env.SIBIDRIFT_DB.prepare("SELECT * FROM upac_representatives LIMIT 10").all();
	  
	  const data = {
		hud_zip_crosswalk: hudResult.results,
		upac_representatives: repResult.results,
	  };
	  
	  return new Response(JSON.stringify(data), {
		headers: { "Content-Type": "application/json" }
	  });
	}
  };
  