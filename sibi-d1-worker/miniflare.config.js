// miniflare.config.js
module.exports = {
  scriptPath: "src/index.js",
  // Inject bindings into your Worker for local simulation
  bindings: {
    // Simulate your ENV_MESSAGE variable
    ENV_MESSAGE: "Loaded on Miniflare"
    // The dummy SIBIDRIFT_DB binding has been removed so that real D1 queries
    // can use the local .db file or the remote database, as configured in wrangler.toml.
  },
};
