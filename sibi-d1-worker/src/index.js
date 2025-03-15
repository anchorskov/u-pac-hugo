export default {
  async fetch(request, env, ctx) {
    const envMessage = env.ENV_MESSAGE || "Default Message";
    console.log("Environment message:", envMessage);
    return new Response(`Worker says: ${envMessage}`, {
      headers: { "Content-Type": "text/plain" }
    });
  }
};
