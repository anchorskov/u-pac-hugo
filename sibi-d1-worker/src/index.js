import { fetchGeography } from "./modules/geocoder.js";
import { getStateName } from "./modules/stateMapping.js";
import { filterLegislators } from "./modules/legislatorFilter.js";
import { lookupZip } from "./modules/zipLookup.js";
import { fetchDistrictByAddress } from "./modules/addressLookup.js"; // New module added

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

    // Endpoint to verify DB connection
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

    // /api/find-candidates endpoint
    if (url.pathname === "/api/find-candidates") {
      let stateName, district;

      // Geolocation branch: if lat & lon provided
      if (url.searchParams.has("lat") && url.searchParams.has("lon")) {
        const lat = url.searchParams.get("lat");
        const lon = url.searchParams.get("lon");
        console.log("Geolocation request:", { lat, lon });

        try {
          const geoData = await fetchGeography(lat, lon);
          console.log("Geocoder returned:", geoData);
          const { stateFips, district: geoDistrict } = geoData;
          district = geoDistrict;
          stateName = await getStateName(stateFips, env.SIBIDRIFT_DB);
          console.log("Mapped stateFips", stateFips, "to stateName:", stateName);
        } catch (error) {
          console.error("Error in geolocation:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            status: 500,
          });
        }

      // ZIP code lookup branch (using zipLookup.js module)
      } else if (url.searchParams.has("zip")) {
        const zip = url.searchParams.get("zip");
        console.log("ZIP lookup request with zip:", zip);

        if (!zip) {
          console.error("ZIP code missing");
          return new Response(JSON.stringify({ error: "Zip code is required" }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            status: 400,
          });
        }

        try {
          const { stateFips, districts, multiDistrict } = await lookupZip(zip, env.SIBIDRIFT_DB);
          stateName = await getStateName(stateFips, env.SIBIDRIFT_DB);

          if (multiDistrict) {
            console.warn(`Multi-district ZIP detected: ${zip} in state ${stateName}`, districts);
            return new Response(JSON.stringify({
              multi_district: true,
              state: stateName,
              districts,
              message: "This ZIP code covers multiple congressional districts. Please provide your full address or use geolocation.",
            }), {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
              status: 200,
            });
          }

          district = districts[0]; // single district scenario
          console.log(`For ZIP ${zip}, extracted stateFips: ${stateFips}, district: ${district}`);

        } catch (error) {
          console.error("Error in ZIP branch:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            status: 500,
          });
        }

      } else {
        console.error("No location parameter provided");
        return new Response(JSON.stringify({ error: "No location parameter provided" }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          status: 400,
        });
      }

      // Retrieve legislator data from KV and filter it
      try {
        const rawLegislators = await env.LEGISLATORS_KV.get("legislators_current");
        if (!rawLegislators) {
          throw new Error("Legislators data not found in KV.");
        }

        const filtered = await filterLegislators(
          stateName,
          district,
          rawLegislators,
          env.SIBIDRIFT_DB
        );

        console.log(`Filtered legislators for ${stateName}, district ${district}:`, filtered.length, "record(s)");

        if (filtered.length === 0) {
          console.warn("No candidates found for this location.");
          return new Response(JSON.stringify({ message: "No candidates found for this location." }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            status: 200,
          });
        }

        return new Response(JSON.stringify(filtered), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });

      } catch (error) {
        console.error("Error filtering legislators:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          status: 500,
        });
      }
    }

    // New endpoint: /api/find-candidates-by-address (address-based lookup)
    if (url.pathname === "/api/find-candidates-by-address") {
      const street = url.searchParams.get("street");
      const city = url.searchParams.get("city");
      const state = url.searchParams.get("state");
      const zip = url.searchParams.get("zip");

      if (!street || !city || !state || !zip) {
        return new Response(JSON.stringify({ error: "Full address (street, city, state, zip) required." }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      try {
        const { stateFips, district } = await fetchDistrictByAddress(street, city, state, zip);
        const stateName = await getStateName(stateFips, env.SIBIDRIFT_DB);
        const rawLegislators = await env.LEGISLATORS_KV.get("legislators_current");

        const filtered = await filterLegislators(
          stateName,
          parseInt(district, 10),
          rawLegislators,
          env.SIBIDRIFT_DB
        );

        return new Response(JSON.stringify(filtered), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });

      } catch (error) {
        console.error("Error fetching candidates by address:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    // Default route
    console.log("Default route hit. Returning greeting message.");
    return new Response("Hello from Cloudflare Worker", {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
};
