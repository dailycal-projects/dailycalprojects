/**
 * A Vite plugin that keeps d3's side effects in the build.
 *
 * d3-transition adds `.transition()` to d3 selections as a side effect of being imported, but the
 * `d3` package declares itself side-effect free. So in a visual that does
 * `import * as d3 from "d3"` and calls `d3.select(...).transition()`, the production bundle would
 * leave d3-transition out, and `.transition` would be undefined (development, which doesn't
 * tree-shake, works either way). This marks the `d3` package and its d3-* modules as having side
 * effects, so they're kept whenever they're imported.
 */
const D3_MODULE = /[\\/]node_modules[\\/]d3(-[\w-]+)?[\\/]/;

export function keepD3SideEffects() {
  return {
    name: "keep-d3-side-effects",
    enforce: "pre",

    async resolveId(source, importer, options) {
      if (!/^d3(-[\w-]+)?($|\/)/.test(source)) {
        return null;
      }
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (resolved && D3_MODULE.test(resolved.id)) {
        return { ...resolved, moduleSideEffects: true };
      }
      return resolved;
    },
  };
}
