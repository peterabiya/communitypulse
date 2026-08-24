/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,

  // App-layer baseline headers. Cloudflare Access (Project 7) is the
  // actual perimeter control — these headers are defense in depth, not
  // a substitute for it.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://*.clerk.accounts.dev https://challenges.cloudflare.com`,
              "connect-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
              "img-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline'",
              "worker-src 'self' blob:",
              "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
