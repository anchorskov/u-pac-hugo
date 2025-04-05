// sibi-d1-worker/miniflare.config.js
module.exports = {
  // Points to your main Worker script.
  scriptPath: "src/index.js",

  // Local D1 database binding.
  d1Databases: [
    {
      binding: "SIBIDRIFT_DB", // Must match your wrangler.toml binding.
      // Use a relative path if possible for portability.
      path: "./sibidrift.db",
    },
  ],

  // Preload your KV namespace for local simulation.
  // This simulates the KV binding so that when your code references LEGISLATORS_KV,
  // Miniflare loads the data from the provided JSON file.
  kvNamespaces: [
    {
      binding: "LEGISLATORS_KV", // Must match your wrangler.toml KV binding.
      // Update the path if your JSON file is stored elsewhere.
      path: "./data/legislators-current.json",
    },
  ],

  // Local-only bindings and environment variables.
  bindings: {
    ENV_MESSAGE: "Loaded on Miniflare",
    // Add any additional variables needed for local testing.
  },

  // Optionally override defaults for local host/port:
  // host: "127.0.0.1",
  // port: 8787,
};
