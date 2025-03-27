import { fetchGeography } from "./modules/geocoder.js";
import { getStateName } from "./modules/stateMapping.js";
import { filterLegislators } from "./modules/legislatorFilter.js";
import { lookupZip } from "./modules/zipLookup.js";
import { fetchDistrictByAddress } from "./modules/addressLookup.js"; // New module added

// Helper function to get ordinal suffix for district numbers
function getOrdinalSuffix(num) {
  const j = num % 10,
        k = num % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
}

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

    // /api/zip-autocomplete endpoint (for ZIP suggestions)
    if (url.pathname === "/api/zip-autocomplete") {
      const query = url.searchParams.get("query");
      if (!query) {
        return new Response(JSON.stringify([]), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
      const sql = `
        SELECT DISTINCT zipcode 
        FROM hud_zip_crosswalk 
        WHERE zipcode LIKE ? 
        ORDER BY zipcode 
        LIMIT 10
      `;
      const prefix = query + '%';
      try {
        const results = await env.SIBIDRIFT_DB.prepare(sql).bind(prefix).all();
        const suggestions = results.results.map(row => row.zipcode);
        return new Response(JSON.stringify(suggestions), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        console.error("Autocomplete error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
        });
      }
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
      } 
      // ZIP code lookup branch
      // ZIP code lookup branch within /api/find-candidates:
else if (url.searchParams.has("zip")) {
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

    // If multiple districts are detected...
    if (multiDistrict) {
      console.warn(`Multi-district ZIP detected: ${zip} in state ${stateName}`, districts);
      // Check if the client requested autoMerge via a query parameter.
      const autoMerge = url.searchParams.get("autoMerge") === "true";
      if (!autoMerge) {
        return new Response(JSON.stringify({
          multi_district: true,
          state: stateName,
          districts: districts,
          message: "This ZIP code covers multiple congressional districts. Please provide your full address or use geolocation."
        }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } else {
        // Auto-merge candidate results.
        const defaultDistrict = districts[0];
        const rawLegislators = await env.LEGISLATORS_KV.get("legislators_current");
        if (!rawLegislators) throw new Error("Legislators data not found in KV.");
        
        let mergedCandidates = [];
        for (const d of districts) {
          const candidatesForDistrict = await filterLegislators(stateName, d, rawLegislators, env.SIBIDRIFT_DB);
          mergedCandidates = mergedCandidates.concat(candidatesForDistrict);
        }
        // Remove duplicates based on the candidate's official full name.
        mergedCandidates = mergedCandidates.filter((candidate, index, self) =>
          index === self.findIndex((t) => t.name.official_full === candidate.name.official_full)
        );
        // Separate senators (statewide) and representatives.
        const senators = mergedCandidates.filter(c => c.terms?.slice(-1)[0]?.type === "sen");
        const reps = mergedCandidates.filter(c => c.terms?.slice(-1)[0]?.type === "rep");
        // For representatives, only include those whose last term's district equals the default district.
        const matchingReps = reps.filter(r => {
          const term = r.terms.slice(-1)[0];
          return term.district == defaultDistrict;
        });
        const selectedRep = matchingReps.length > 0 ? matchingReps[0] : null;
        if (!selectedRep) {
          const formattedDistrict = `${defaultDistrict}${getOrdinalSuffix(defaultDistrict)} Congressional District`;
          return new Response(JSON.stringify({
            header: {
              state: stateName,
              cd: formattedDistrict
            },
            message: "The representative seat is currently vacant.",
            candidates: senators  // Only senators returned.
          }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
        const finalCandidates = senators.concat(selectedRep);
        const formattedDistrict = `${defaultDistrict}${getOrdinalSuffix(defaultDistrict)} Congressional District`;
        return new Response(JSON.stringify({
          header: {
            state: stateName,
            cd: formattedDistrict
          },
          candidates: finalCandidates
        }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }
            

    // Single district scenario: if multiDistrict is false.
    district = districts[0];
    console.log(`For ZIP ${zip}, extracted stateFips: ${stateFips}, district: ${district}`);
  } catch (error) {
    console.error("Error in ZIP branch:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 500,
    });
  }
}


      // For single district, retrieve legislator data from KV and filter it.
      try {
        const rawLegislators = await env.LEGISLATORS_KV.get("legislators_current");
        if (!rawLegislators) throw new Error("Legislators data not found in KV.");
        const filtered = await filterLegislators(stateName, district, rawLegislators, env.SIBIDRIFT_DB);
        console.log(`Filtered legislators for ${stateName}, district ${district}:`, filtered.length, "record(s)");
        if (filtered.length === 0) {
          console.warn("No candidates found for this location.");
          return new Response(JSON.stringify({ message: "No candidates found for this location." }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            status: 200,
          });
        }
        const formattedDistrict = `${district}${getOrdinalSuffix(district)} Congressional District`;
        return new Response(JSON.stringify({
          header: {
            state: stateName,
            cd: formattedDistrict
          },
          candidates: filtered
        }), {
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

    // /api/find-candidates-by-address endpoint remains unchanged
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
