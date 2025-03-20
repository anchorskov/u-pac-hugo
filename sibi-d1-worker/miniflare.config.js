// miniflare.config.js
module.exports = {
  // Points to your main Worker script
  scriptPath: "src/index.js",

  // Tells Miniflare which local D1 databases to bind
  d1Databases: [
    {
      binding: "SIBIDRIFT_DB",  // Must match the binding in wrangler.toml
      path: "/home/anchor/projects/u-pac/u-pac-hugo/sibi-d1-worker/sibidrift.db",
    },
  ],

  // Inject environment variables for local simulation
  bindings: {
    ENV_MESSAGE: "Loaded on Miniflare",
    // Add any other local-only variables you need here
  },

  // (Optional) Set local port or host if you want to override defaults
  // port: 8787,
  // host: "127.0.0.1",
};
