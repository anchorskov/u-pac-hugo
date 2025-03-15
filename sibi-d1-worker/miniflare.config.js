// miniflare.config.js
module.exports = {
    scriptPath: "src/index.js",
    // Inject bindings into your Worker for local simulation
    bindings: {
      // Simulate your ENV_MESSAGE variable
      ENV_MESSAGE: "Loaded on Miniflare",
      // Simulate a D1 binding named SIBIDRIFT_DB
      SIBIDRIFT_DB: {
        // A dummy prepare() method to simulate the D1 API
        prepare(query) {
          console.log("Simulated prepare called with query:", query);
          return {
            // Simulate a chainable bind() method
            bind(...args) {
              console.log("Simulated bind called with:", args);
              return this;
            },
            // Simulate the all() method returning dummy results
            async all() {
              console.log("Simulated all() returning dummy data.");
              // Return dummy data structured similarly to a D1 query result.
              return { results: [{ id: 1, message: "Dummy Data" }] };
            },
          };
        },
      },
    },
  };
  