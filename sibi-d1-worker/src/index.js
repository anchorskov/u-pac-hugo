import { fetchGeography } from "./modules/geocoder.js";
import { getStateName } from "./modules/stateMapping.js";
import { filterLegislators } from "./modules/legislatorFilter.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      console.log("OPTIONS preflight received");
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

    // Test endpoint to verify DB connection (using hud_zip_crosswalk/upac_states)
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
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            status: 500,
          }
        );
      }
    }

    // /api/find-candidates endpoint
    if (url.pathname === "/api/find-candidates") {
      let stateName, district;

      // Geolocation branch: if lat & lon are provided
      if (url.searchParams.has("lat") && url.searchParams.has("lon")) {
        const lat = url.searchParams.get("lat");
        const lon = url.searchParams.get("lon");
        console.log("Geolocation request received:", { lat, lon });
        try {
          const geoData = await fetchGeography(lat, lon);
          console.log("Geocoder returned:", geoData);
          const { stateFips, district: geoDistrict } = geoData;
          district = geoDistrict;
          stateName = await getStateName(stateFips, env.SIBIDRIFT_DB);
          console.log("Mapped stateFips", stateFips, "to stateName:", stateName);
        } catch (error) {
          console.error("Error in geolocation branch:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
              status: 500,
            }
          );
        }
      } else if (url.searchParams.has("zip")) {
        // ZIP branch: using ZIP lookup
        const zip = url.searchParams.get("zip");
        console.log("ZIP lookup request received with zip:", zip);
        if (!zip) {
          console.error("ZIP code missing");
          return new Response(
            JSON.stringify({ error: "Zip code is required" }),
            {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
              status: 400,
            }
          );
        }
        try {
          const zipQuery = await env.SIBIDRIFT_DB.prepare(
            `SELECT state_fips_code, cd FROM hud_zip_crosswalk WHERE zipcode = ?`
          ).bind(zip).all();
          console.log("ZIP query results:", zipQuery.results);
          if (zipQuery.results.length === 0) {
            throw new Error("ZIP code not found in database.");
          }
          const stateFips = zipQuery.results[0].state_fips_code;
          const fullCd = zipQuery.results[0].cd;
          district = fullCd.substring(2); // Extract district (last two digits)
          console.log(`For ZIP ${zip}, extracted stateFips: ${stateFips} and district: ${district}`);
          stateName = await getStateName(stateFips, env.SIBIDRIFT_DB);
          console.log("Mapped stateFips", stateFips, "to stateName:", stateName);
        } catch (error) {
          console.error("Error in ZIP branch:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
              status: 500,
            }
          );
        }
      } else {
        console.error("No location parameter provided");
        return new Response(
          JSON.stringify({ error: "No location parameter provided" }),
          {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            status: 400,
          }
        );
      }

      // Retrieve legislator data from KV JSON and filter it using the legislatorFilter module.
      try {
        const rawLegislators = await env.LEGISLATORS_KV.get("legislators_current");
        if (!rawLegislators) {
          throw new Error("Legislators data not found in KV.");
        }
        // Await the asynchronous filterLegislators call and pass the DB connection.
        const filtered = await filterLegislators(stateName, district, rawLegislators, env.SIBIDRIFT_DB);
        console.log(`Filtered legislators for state: ${stateName}, district: ${district} => ${filtered.length} record(s)`);
        if (filtered.length === 0) {
          console.error("No candidates found for this location.");
          return new Response(
            JSON.stringify({ message: "No candidates found for this location." }),
            {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
              status: 200,
            }
          );
        }
        return new Response(JSON.stringify(filtered), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (error) {
        console.error("Error filtering legislators:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            status: 500,
          }
        );
      }
    }

    // /api/legislators endpoint: Return raw KV JSON data.
    if (url.pathname === "/api/legislators") {
      console.log("Legislators KV request received");
      try {
        const rawJson = await env.LEGISLATORS_KV.get("legislators_current");
        if (!rawJson) {
          console.error("No legislators data found in KV");
          return new Response(
            JSON.stringify({ error: "No data found" }),
            {
              status: 404,
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            }
          );
        }
        console.log("Legislators KV data retrieved successfully");
        return new Response(rawJson, {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (error) {
        console.error("Error fetching legislators from KV:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }
    }

    console.log("Default route hit. Returning greeting message.");
    return new Response("Hello from Cloudflare Worker", {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
};
