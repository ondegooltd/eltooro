export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { loadServerEnv } = await import("./lib/env/server");
    loadServerEnv();
  }
}
