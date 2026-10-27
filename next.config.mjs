import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    // Authenticated API responses must never be stored by the service worker.
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname.startsWith("/v1/"),
        handler: "NetworkOnly",
      },
    ],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  // In production Caddy sends /v1/* straight to the API. In development the
  // dev server forwards it so the browser can stay on one origin.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    const api = (process.env.API_INTERNAL_URL || "http://localhost:8080").replace(/\/$/, "");
    return [{ source: "/v1/:path*", destination: `${api}/v1/:path*` }];
  },
};

export default withPWA(nextConfig);
