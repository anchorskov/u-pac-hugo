export default {
	async fetch(request, env, ctx) {
	  if (!env.SIBIDRIFT_DB) {
		return new Response("D1 binding not available in local mode.", { status: 500 });
	  }
	  
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
  