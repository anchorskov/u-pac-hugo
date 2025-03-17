export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/find-candidates") {
      const zip = url.searchParams.get("zip");
      if (!zip) {
        return new Response(JSON.stringify({ error: "Zip code is required" }), {
          headers: { 
            "content-type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Content-Security-Policy": "default-src 'self';"
          },
          status: 400,
        });
      }
      
      try {
        // Query the D1 database using substring logic:
        // - If the last two digits of z.cd are '00', match 'At Large'
        // - Otherwise compare directly to r.district_id
        const { results } = await env.SIBIDRIFT_DB.prepare(
          `SELECT r.*
           FROM hud_zip_crosswalk AS z
           JOIN upac_states AS s
             ON z.state_fips_code = s.fips_state_code
           JOIN upac_representatives AS r
             ON s.name = r.state
                AND (
                  (
                    SUBSTR(z.cd, 3, 2) = '00'
                    AND r.district_id = 'At Large'
                  )
                  OR (
                    SUBSTR(z.cd, 3, 2) = r.district_id
                  )
                )
           WHERE z.zipcode = ?`
        ).bind(zip).all();
        
        console.log(`Query for ZIP ${zip} returned ${results.length} record(s).`);

        if (results.length === 0) {
          return new Response(JSON.stringify({ message: "No candidates found for the provided ZIP code." }), {
            headers: { 
              "content-type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Content-Security-Policy": "default-src 'self';"
            },
            status: 200,
          });
        }
        
        return new Response(JSON.stringify(results), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=60",
            "Content-Security-Policy": "default-src 'self';"
          },
        });
      } catch (error) {
        console.error("Error querying D1 database:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Content-Security-Policy": "default-src 'self';"
          },
          status: 500,
        });
      }
    }
    
    // Default response for other routes
    return new Response("Hello from Cloudflare Worker", {
      headers: {
        "Content-Security-Policy": "default-src 'self';"
      },
    });
  },
};
