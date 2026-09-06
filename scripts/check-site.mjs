import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";

const publicDir = new URL("../public/", import.meta.url);
const distDir = new URL("../dist/", import.meta.url);
const index = await readFile(new URL("index.html", publicDir), "utf8");
const config = await readFile(new URL("config.js", publicDir), "utf8");

for (const [scriptIndex, match] of [...index.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
  if (match[1].trim()) new Script(match[1], { filename: `index-inline-${scriptIndex + 1}.js` });
}

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

for (const needle of ["ydufwdgd3z", "showLander", "showProof", "metaLeadEvent", "Family-Owned", "Serving Lake Norman & Surrounding Areas", "Popular Fence Materials"]) {
  if (!config.includes(needle)) throw new Error(`Missing funnel configuration: ${needle}`);
}

for (const needle of ["eventPrefix}_path_", "eventPrefix}_start", "funnelVariantName", "eventID", "action_source: 'website'"]) {
  if (!index.includes(needle)) throw new Error(`Missing tracking capability: ${needle}`);
}

const assetMatches = [...config.matchAll(/\$\{A_W_ASSET_BASE\}([^`"]+)/g)];
for (const [, assetPath] of assetMatches) {
  await stat(fileURLToPath(new URL(`assets/${assetPath}`, publicDir)));
}

if (!index.includes('document.write(\'<script src="./config.js">')) {
  throw new Error("Missing nested VS Code preview config fallback.");
}

await stat(new URL("a/index.html", distDir));
await stat(new URL("b/index.html", distDir));
await stat(new URL("c/index.html", distDir));
console.log(`Validated ${assetMatches.length} configured asset references.`);
