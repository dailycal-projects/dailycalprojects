import type { APIRoute } from "astro";
import { withBase } from "../lib/path";

// Generates robots.txt at build time, so the Sitemap line always matches the `site`/`base`
// configured in astro.config.mjs. /editors/ holds internal tools for staff only.
export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL(withBase("/sitemap-index.xml"), site);

  const body = `User-agent: *
Disallow: ${withBase("/editors/")}
Allow: /

Sitemap: ${sitemapURL.href}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
};
