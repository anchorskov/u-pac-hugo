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

    // Test endpoint to verify local DB connection and count records
    if (url.pathname === "/api/test-db") {
      try {
        const countQuery = await env.SIBIDRIFT_DB.prepare(
          "SELECT COUNT(*) AS total FROM hud_zip_crosswalk;"
        ).all();
        console.log("hud_zip_crosswalk count:", countQuery.results[0].total);
        return new Response(JSON.stringify(countQuery.results[0]), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        console.error("Error running count query:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 500,
        });
      }
    }

    if (url.pathname === "/api/find-candidates") {
      const zip = url.searchParams.get("zip");
      if (!zip) {
        return new Response(
          JSON.stringify({ error: "Zip code is required" }),
          {
            headers: {
              "content-type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            status: 400,
          }
        );
      }

      try {
        /** 🔹 STEP 1: Get State & District from ZIP **/
        const zipQuery = await env.SIBIDRIFT_DB.prepare(
          `SELECT state_fips_code, cd FROM hud_zip_crosswalk WHERE zipcode = ?`
        )
          .bind(zip)
          .all();

        if (zipQuery.results.length === 0) {
          console.log(`ZIP ${zip} not found.`);
          return new Response(
            JSON.stringify({ message: "ZIP code not found in database." }),
            {
              headers: {
                "content-type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              status: 404,
            }
          );
        }

        const stateFips = zipQuery.results[0].state_fips_code;
        const fullCd = zipQuery.results[0].cd;
        const district = fullCd.substring(2); // Extract district (last two digits)

        console.log(
          `ZIP ${zip} maps to State FIPS ${stateFips} and District ${district}`
        );

        /** 🔹 STEP 2: Get State Name from FIPS **/
        const stateQuery = await env.SIBIDRIFT_DB.prepare(
          `SELECT name FROM upac_states WHERE fips_state_code = ?`
        )
          .bind(stateFips)
          .all();

        if (stateQuery.results.length === 0) {
          console.log(`State FIPS ${stateFips} not found.`);
          return new Response(
            JSON.stringify({ message: "State not found." }),
            {
              headers: {
                "content-type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              status: 404,
            }
          );
        }

        const stateName = stateQuery.results[0].name;

        /** 🔹 STEP 3: Fetch At Large Representative **/
        const atLargeQuery = await env.SIBIDRIFT_DB.prepare(
          `SELECT * FROM upac_representatives WHERE state = ? AND district_id = 'At Large'`
        )
          .bind(stateName)
          .all();

        /** 🔹 STEP 4: Fetch District Representative(s) **/
        const districtQuery = await env.SIBIDRIFT_DB.prepare(
          `SELECT * FROM upac_representatives WHERE state = ? AND district_id = ?`
        )
          .bind(stateName, district)
          .all();

        /** 🔹 STEP 5: Merge Results **/
        const results = [...atLargeQuery.results, ...districtQuery.results];

        console.log(`Final Result: ${results.length} record(s) for ZIP ${zip}`);

        if (results.length === 0) {
          return new Response(
            JSON.stringify({
              message: "No candidates found for the provided ZIP code.",
            }),
            {
              headers: {
                "content-type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              status: 200,
            }
          );
        }

        return new Response(JSON.stringify(results), {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        console.error("Error querying D1 database:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 500,
        });
      }
    }

    // Default response for other routes
    return new Response("Hello from Cloudflare Worker", {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
};
