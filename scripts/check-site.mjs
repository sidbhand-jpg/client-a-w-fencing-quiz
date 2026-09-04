import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const publicDir = new URL("../public/", import.meta.url);
const index = await readFile(new URL("index.html", publicDir), "utf8");
const config = await readFile(new URL("config.js", publicDir), "utf8");

const requiredIndexChecks = [
  ["A & W Fencing", "page title or metadata"],
  ["config.js", "configuration script"],
  ["quiz_profile", "lead profile payload"],
];

for (const [needle, label] of requiredIndexChecks) {
  if (!index.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

for (const needle of ["a_w_fencing", "+1 (704) 771-1901", "fence_type"]) {
  if (!config.includes(needle)) throw new Error(`Missing config value: ${needle}`);
}

const assetMatches = [...config.matchAll(/(?:image|logo|crewImage)\w*:\s*["'](\/assets\/[^"']+)["']/gi)];
for (const [, assetPath] of assetMatches) {
  await stat(fileURLToPath(new URL(assetPath.replace(/^\//, ""), publicDir)));
}

await stat(new URL("wrangler.jsonc", root));
console.log(`Validated ${assetMatches.length} configured asset references.`);
