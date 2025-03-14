module.exports = {
    // Use your Worker script entry point. For example, if your Worker is in /api/lookup.js:
    scriptPath: "api/lookup.js",
    
    // Define a KV namespace binding.
    kvNamespaces: [
      {
        binding: "HUDZIP", // This is the name you'll use in your Worker (e.g., await HUDZIP.get(...))
        id: "local-hudzip", // This can be any string for local testing.
      },
    ],
    
    // Optionally, specify a port to run on:
    port: 8787,
  };
  