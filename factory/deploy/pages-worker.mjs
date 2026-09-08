// Server-side Pages advanced-mode worker. Never place backend secrets in static assets.
const ORIGIN = "https://merge-proof.ohcaygo.com";
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const dynamic = url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/download/") || url.pathname === "/webhooks/stripe";
    if (!dynamic) return env.ASSETS.fetch(request);
    const unavailable = () => new Response(JSON.stringify({error: "BACKEND_UNAVAILABLE"}), {
      status: 503, headers: {"Content-Type": "application/json", "Cache-Control": "no-store"},
    });
    if (!env.FACTORY_BACKEND || !env.FACTORY_PROXY_SECRET) return unavailable();
    if (url.origin !== ORIGIN) return new Response("Not found", {status: 404});
    let backend;
    try {
      backend = new URL(env.FACTORY_BACKEND);
      if (backend.protocol !== "https:" || backend.username || backend.password ||
          backend.pathname !== "/" || backend.search || backend.hash) return unavailable();
    } catch { return unavailable(); }
    const headers = new Headers(request.headers);
    headers.set("x-mp-proxy-key", env.FACTORY_PROXY_SECRET);
    headers.set("x-mp-client-ip", request.headers.get("CF-Connecting-IP") || "");
    headers.delete("host");
    headers.delete("x-forwarded-for");
    const target = backend.origin + url.pathname + url.search;
    try {
      const upstream = await fetch(target, {
        method: request.method, headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "manual",
      });
      const response = new Response(upstream.body, upstream);
      response.headers.set("Cache-Control", "no-store");
      response.headers.set("Referrer-Policy", "no-referrer");
      return response;
    } catch { return unavailable(); }
  },
};
