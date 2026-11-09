/**
 * `npm run build`: runs `astro build`, showing its output as it goes, and saves that output as a page,
 * dist/editors/build.html, which the site serves at /editors/build. So the deployed site shows the
 * log of the build that made it, warnings included, as it looked in the console.
 *
 * Arguments are passed on to `astro build`.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { stripVTControlCharacters } from "node:util";

const PAGE = "dist/editors/build.html";
// Astro's command, run with this Node (so it works outside `npm run` too)
const ASTRO = fileURLToPath(new URL("../node_modules/astro/bin/astro.mjs", import.meta.url));

const started = new Date();
const output = [];
const astro = spawn(process.execPath, [ASTRO, "build", ...process.argv.slice(2)], {
  stdio: ["inherit", "pipe", "pipe"],
  // Its output is piped, which turns its colors off; keep them in a terminal (the page drops them)
  env: process.stdout.isTTY ? { ...process.env, FORCE_COLOR: "1" } : process.env,
});
astro.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  output.push(chunk);
});
astro.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
  output.push(chunk);
});

astro.on("close", (code) => {
  // e.g. "November 9, 2026 at 1:25:57 AM PST" (Berkeley's time, wherever it was built)
  const startTime = started.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "long",
    timeZone: "America/Los_Angeles",
  });
  const duration = `${((Date.now() - started.valueOf()) / 1000).toFixed(1)}s`;
  const header = `DAILY CAL DATA\nBuilt at ${startTime} in ${duration}\n${"=".repeat(30)}\n\n`;
  const log = (header + stripVTControlCharacters(Buffer.concat(output).toString()))
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  mkdirSync("dist/editors", { recursive: true });
  writeFileSync(
    PAGE,
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Build log</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 16px; }
  pre {
    margin: 0;
    font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>
</head>
<body>
<pre>${log}</pre>
</body>
</html>
`,
  );
  process.exit(code ?? 1);
});
