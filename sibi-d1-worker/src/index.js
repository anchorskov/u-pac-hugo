export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (url.pathname === "/api/find-candidates") {
      const zip = url.searchParams.get("zip");
      if (!zip) {
        return new Response(JSON.stringify({ error: "Zip code is required" }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Content-Security-Policy": "default-src 'self';",
            "Access-Control-Allow-Origin": "*",
          },
          status: 400,
        });
      }
      
      try {
        // Revised query to return only the representative record matching the zip code.
        // It joins the tables and checks:
        //   - If z.cd is '00', then r.district_id must be 'At Large'
        //   - Otherwise, r.district_id must equal z.cd
        const { results } = await env.SIBIDRIFT_DB.prepare(
          `SELECT r.*
           FROM hud_zip_crosswalk AS z
           JOIN upac_states AS s ON z.state_fips_code = s.fips_state_code
           JOIN upac_representatives AS r ON s.name = r.state
             AND (
                  (z.cd = '00' AND r.district_id = 'At Large')
                  OR (z.cd <> '00' AND r.district_id = z.cd)
             )
           WHERE z.zipcode = ?`
        ).bind(zip).all();
        
        console.log(`Query for ZIP ${zip} returned ${results.length} record(s).`);

        if (results.length === 0) {
          return new Response(JSON.stringify({ message: "No candidates found for the provided ZIP code." }), {
            headers: {
              "content-type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Content-Security-Policy": "default-src 'self';",
              "Access-Control-Allow-Origin": "*",
            },
            status: 200,
          });
        }
        
        return new Response(JSON.stringify(results), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=60",
            "Content-Security-Policy": "default-src 'self';",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        console.error("Error querying D1 database:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Content-Security-Policy": "default-src 'self';",
            "Access-Control-Allow-Origin": "*",
          },
          status: 500,
        });
      }
    }
    
    // Default response for other routes
    return new Response("Hello from Cloudflare Worker", {
      headers: {
        "Content-Security-Policy": "default-src 'self';",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
