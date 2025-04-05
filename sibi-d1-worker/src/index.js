// src/index.js
import { fetchGeography } from "./modules/geocoder.js";
import { getStateName } from "./modules/stateMapping.js";
import { filterLegislators } from "./modules/legislatorFilter.js";
import { lookupZip } from "./modules/zipLookup.js";
import { fetchDistrictByAddress } from "./modules/addressLookup.js";

async function loadLegislators(env) {
  const raw = await env.LEGISLATORS_KV.get("legislators_current");
  if (!raw) throw new Error("❌ No legislator data available in KV");
  return raw;
}


function getOrdinalSuffix(num) {
  const j = num % 10, k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    console.log("💡 Incoming request path:", url.pathname);

    // 🔐 Handle CORS preflight
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

    // 🧠 Avoid recursion: block /mock path from fetch loop
    if (!url.pathname.startsWith('/api')) {
      return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not Found", { status: 404 });
    }
    
    if (url.pathname === "/api/test-kv") {
      try {
        const raw = await env.LEGISLATORS_KV.get("legislators_current");
        return new Response(raw, {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    if (url.pathname === "/api/zip-autocomplete") {
      const query = url.searchParams.get("query") || "";
      if (query.length < 2) {
        return new Response(JSON.stringify([]), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      try {
        const sql = `SELECT DISTINCT zipcode FROM hud_zip_crosswalk WHERE zipcode LIKE ? ORDER BY zipcode LIMIT 10`;
        const results = await env.SIBIDRIFT_DB.prepare(sql).bind(query + '%').all();
        const suggestions = results.results.map(row => row.zipcode);
        return new Response(JSON.stringify(suggestions), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    if (url.pathname === "/api/test-state") {
      try {
        const fips = url.searchParams.get("fips") || "06";
        const stateName = await getStateName(fips, env.SIBIDRIFT_DB);
        return new Response(JSON.stringify({ fips, state: stateName }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    if (url.pathname === "/api/find-candidates") {
      let stateName, district;

      try {
        if (url.searchParams.has("lat") && url.searchParams.has("lon")) {
          const geoData = await fetchGeography(url.searchParams.get("lat"), url.searchParams.get("lon"));
          const { stateFips, district: geoDistrict } = geoData;
          stateName = await getStateName(stateFips, env.SIBIDRIFT_DB);
          district = geoDistrict;
        } else if (url.searchParams.has("zip")) {
          const zip = url.searchParams.get("zip");
          const { stateFips, districts, multiDistrict } = await lookupZip(zip, env.SIBIDRIFT_DB);
          stateName = await getStateName(stateFips, env.SIBIDRIFT_DB);

          if (multiDistrict && url.searchParams.get("autoMerge") !== "true") {
            return new Response(JSON.stringify({
              multi_district: true,
              state: stateName,
              districts,
              message: "This ZIP code covers multiple congressional districts. Please provide your full address or use geolocation."
            }), {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }

          district = districts[0];
        }

        const raw = await loadLegislators(env);
        const filtered = await filterLegislators(stateName, district, raw, env.SIBIDRIFT_DB);
        const formatted = `${district}${getOrdinalSuffix(district)} Congressional District`;

        return new Response(JSON.stringify({
          header: { state: stateName, cd: formatted },
          candidates: filtered,
          message: filtered.length === 0 ? "No candidates found for this location." : undefined
        }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    if (url.pathname === "/api/find-candidates-by-address") {
      const { street, city, state, zip } = Object.fromEntries(url.searchParams);
      if (!street || !city || !state || !zip) {
        return new Response(JSON.stringify({ error: "Full address (street, city, state, zip) required." }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      try {
        const { stateFips, district } = await fetchDistrictByAddress(street, city, state, zip);
        const stateName = await getStateName(stateFips, env.SIBIDRIFT_DB);
        const raw = await loadLegislators(env);
        const filtered = await filterLegislators(stateName, parseInt(district, 10), raw, env.SIBIDRIFT_DB);
        const formatted = `${district}${getOrdinalSuffix(district)} Congressional District`;

        return new Response(JSON.stringify({
          header: { state: stateName, cd: formatted },
          candidates: filtered,
          message: filtered.length === 0 ? "No candidates found for this location." : undefined
        }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
              } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    return new Response("Hello from Cloudflare Worker", {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
};
