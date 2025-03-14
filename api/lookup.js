// /api/lookup.js
export async function onRequest(context) {
    // Get the zip code from the query string (e.g., ?zip=12345)
    const { searchParams } = new URL(context.request.url);
    const zip = searchParams.get("zip");
    
    if (!zip) {
      return new Response(JSON.stringify({ error: "Missing zip code" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // --- Step A: Lookup the HUDZIP Crosswalk ---
    // Here you would normally lookup the zip in your crosswalk data to determine state and district.
    // For example, assume the crosswalk returns:
    // { state: "North Carolina", district: "12", abbreviation: "NC" }
    // In a real-world scenario, this crosswalk data could be stored as a JSON file or in Cloudflare KV.
    // For now, we simulate with dummy data:
    const crosswalkResult = {
      state: "North Carolina",
      district: "12",
      abbreviation: "NC",
    };
  
    // --- Step B: Query the JSON Data for Candidates ---
    // Your JSON file (upac_representatives.json) contains mappings like "NC-12" : { candidate details }
    // In production, you could store this JSON in KV or bundle it with your Worker.
    // For local testing, assume it's bundled as follows:
    const candidates = await getCandidates(); // See note below
  
    // Build the composite key
    const districtKey = crosswalkResult.district === "00" ? "At-Large" : crosswalkResult.district;
    const compositeKey = `${crosswalkResult.abbreviation}-${districtKey}`;
  
    // Look up candidate info by the composite key
    const candidate = candidates[compositeKey];
  
    if (!candidate) {
      return new Response(JSON.stringify({ error: "Candidate not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    // Return the candidate data as JSON
    return new Response(JSON.stringify(candidate), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Example helper: load the candidates JSON file from the bundled asset
  async function getCandidates() {
    // When using Cloudflare Pages Functions, you can use an import to include a local JSON file.
    // For local testing, assume the file is in the same project.
    // In a production Worker, consider uploading the JSON to KV.
    return import("../upac_representatives.json").then((module) => module.default || module);
  }
  