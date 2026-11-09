/**
 * `npm run build`: runs `astro build`, showing its output as it goes, and saves that output, as plain
 * text, to dist/editors/build.txt, which the site serves at /editors/build.txt.
 * So the deployed site shows the log of the build that made it, warnings included.
 *
 * Arguments are passed on to `astro build`.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { stripVTControlCharacters } from "node:util";

const LOG = "dist/editors/build.txt";
// Astro's command, run with this Node (so it works outside `npm run` too)
const ASTRO = fileURLToPath(new URL("../node_modules/astro/bin/astro.mjs", import.meta.url));

const output = [];
const astro = spawn(process.execPath, [ASTRO, "build", ...process.argv.slice(2)], {
  stdio: ["inherit", "pipe", "pipe"],
  // Its output is piped, which turns its colors off; keep them in a terminal (the log drops them)
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
  mkdirSync("dist/editors", { recursive: true });
  writeFileSync(LOG, stripVTControlCharacters(Buffer.concat(output).toString()));
  process.exit(code ?? 1);
});
