/**
 * A Vite plugin that replaces browser-only packages (Leaflet, react-leaflet, sigma, ...) with an
 * inert stand-in when the site is rendered on the server at build time, like the old Gatsby site's
 * gatsby-plugin-react-leaflet did.
 *
 * These packages touch `window` as soon as they're imported, so the build crashes on any page whose
 * visuals import them, even though those visuals only ever run in the browser (`client:only`): Astro
 * still imports their modules on the server to render the page. In the browser, the real packages
 * load as usual. Their CSS (e.g. leaflet/dist/leaflet.css) isn't replaced.
 */
import { readFileSync, globSync } from "node:fs";

// Package names (and their subpaths, e.g. "sigma/utils") to replace on the server
const BROWSER_ONLY =
  /^(leaflet|leaflet[.-][\w.-]+|react-leaflet(-[\w-]+)?|@react-leaflet\/[\w-]+|sigma|@sigma\/[\w-]+)(\/.*)?$/;
const STUB_PREFIX = "\0browser-only-stub:";

/** The names each browser-only package is imported by (`import { a, b as c } from "pkg"`). */
function importedNames(sourceGlob) {
  const names = new Map();
  const importStatement = /import\s+(?:[\w$]+\s*,\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
  for (const file of globSync(sourceGlob)) {
    const source = readFileSync(file, "utf8");
    for (const [, specifiers, pkg] of source.matchAll(importStatement)) {
      if (!BROWSER_ONLY.test(pkg) || pkg.endsWith(".css")) {
        continue;
      }
      const list = names.get(pkg) ?? new Set();
      for (const specifier of specifiers.split(",")) {
        const name = specifier.trim().split(/\s+as\s+/)[0];
        if (/^[A-Za-z_$][\w$]*$/.test(name)) {
          list.add(name);
        }
      }
      names.set(pkg, list);
    }
  }
  return names;
}

// Stands in for anything: every property, call and `new` returns the stand-in again, so top-level
// setup code in the visuals (e.g. `L.icon({...})`) runs without errors. Not thenable, so awaiting
// it doesn't hang.
const STUB_SOURCE = `
const stub = new Proxy(function () {}, {
  get: (_target, key) => (key === "then" ? undefined : key === Symbol.toPrimitive ? () => "" : stub),
  apply: () => stub,
  construct: () => stub,
});
export default stub;
`;

/** @param {{ sourceGlob: string }} options files whose imports of these packages to stub */
export function browserOnlyPackages({ sourceGlob }) {
  let names = new Map();

  return {
    name: "browser-only-packages",
    enforce: "pre",

    // In development, Vite hands packages straight to Node on the server instead of through plugins
    // like this one; noExternal makes it resolve these through plugins too
    config() {
      return { ssr: { noExternal: [BROWSER_ONLY] } };
    },

    buildStart() {
      names = importedNames(sourceGlob);
    },

    resolveId(id, _importer, options) {
      const onServer = this.environment
        ? this.environment.config.consumer === "server"
        : options?.ssr;
      if (onServer && BROWSER_ONLY.test(id) && !id.endsWith(".css")) {
        return STUB_PREFIX + id;
      }
      return null;
    },

    load(id) {
      if (!id.startsWith(STUB_PREFIX)) {
        return null;
      }
      const pkg = id.slice(STUB_PREFIX.length);
      const exports = [...(names.get(pkg) ?? [])].map((name) => `export const ${name} = stub;`);
      return STUB_SOURCE + exports.join("\n");
    },
  };
}
