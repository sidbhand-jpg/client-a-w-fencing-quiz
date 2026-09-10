import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";

const publicDir = new URL("../public/", import.meta.url);
const distDir = new URL("../dist/", import.meta.url);
const index = await readFile(new URL("index.html", publicDir), "utf8");
const config = await readFile(new URL("config.js", publicDir), "utf8");
const capiFunction = await readFile(new URL("../functions/api/capi.js", import.meta.url), "utf8");

for (const [scriptIndex, match] of [...index.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
  if (match[1].trim()) new Script(match[1], { filename: `index-inline-${scriptIndex + 1}.js` });
}

const requiredIndexChecks = [
  ["A & W Fencing", "page title or metadata"],
  ["config.js", "configuration script"],
  ["new URLSearchParams()", "flat webhook form payload"],
  ["fence_type:    answers.fence_type", "separate quiz answer fields"],
  ["zip-field-label", "route /d ZIP field label"],
  ["zipLabelBlink", "route /d ZIP label animation"],
  ["favicon.webp", "optimized favicon"],
  ["variantConfig.showProof", "route-specific proof loading"],
  ["variantConfig.showLander && L.crewImageUrl", "route-specific hero loading"],
  ["<script defer src=\"https://unpkg.com/lucide", "non-blocking icon library"],
];

for (const [needle, label] of requiredIndexChecks) {
  if (!index.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

for (const needle of ["+1 (704) 771-1901", "fence_type"]) {
  if (!config.includes(needle)) throw new Error(`Missing config value: ${needle}`);
}

for (const needle of ["allowedZipCodes", 'label: "Enter your Zip Code"', 'questionIds: ["project_type", "fence_type"]', 'id: "project_type"']) {
  if (!config.includes(needle)) throw new Error(`Missing route /d configuration: ${needle}`);
}

const allowedZipMatch = config.match(/allowedZipCodes:\s*"([0-9, ]+)"/);
if (!allowedZipMatch) throw new Error("Missing comma-separated ZIP allowlist.");
const allowedZipCodes = allowedZipMatch[1].split(",").map(zip => zip.trim()).filter(Boolean);
if (allowedZipCodes.length !== 109 || new Set(allowedZipCodes).size !== 109) {
  throw new Error("Route /d must have exactly 109 unique approved ZIP codes.");
}
if (allowedZipCodes.some(zip => !/^\d{5}$/.test(zip))) {
  throw new Error("Route /d contains an invalid ZIP code.");
}

for (const needle of ["renderZipGate", "parseAllowedZipCodes", "answers.project_type", "variantConfig.zipFirst"]) {
  if (!index.includes(needle)) throw new Error(`Missing route /d behavior: ${needle}`);
}

if (!index.includes("a|b|c|d|e") || !index.includes("e: { name: 'Simple short form'")) {
  throw new Error("Missing route /e browser wiring.");
}
if (!config.includes('name: "Simple short form"')) {
  throw new Error("Missing route /e configuration.");
}
for (const needle of ['implicitConsent: true', '{ label: "Repair", icon: "wrench" }', '{ label: "Replace", icon: "refresh-cw" }']) {
  if (!config.includes(needle)) throw new Error(`Missing route /e behavior: ${needle}`);
}
for (const needle of ["variantConfig.questionOverrides", "usesImplicitConsent || Boolean(smsCheck?.checked)", "By clicking submit"]) {
  if (!index.includes(needle) && !config.includes(needle)) throw new Error(`Missing route /e consent or answer wiring: ${needle}`);
}

for (const needle of ["META_CAPI_ACCESS_TOKEN", "crypto.subtle.digest", 'event_name: "Lead"', "event_id: eventId", "CF-Connecting-IP"]) {
  if (!capiFunction.includes(needle)) throw new Error(`Missing server-side CAPI behavior: ${needle}`);
}

for (const needle of ["fetch('/api/capi'", "event_id: payload.capi_event_id"]) {
  if (!index.includes(needle) && !index.includes("fetchWithTimeout('/api/capi'")) throw new Error(`Missing browser-to-CAPI handoff: ${needle}`);
}

for (const needle of ["WEBHOOK_TIMEOUT_MS", "CAPI_TIMEOUT_MS", "fetchWithTimeout(C.webhookUrl", "controller.abort()", "sessionStorage.removeItem('attribution_data')"]) {
  if (!index.includes(needle)) throw new Error(`Missing resilient submission behavior: ${needle}`);
}

const submitHandler = index.slice(index.indexOf("async function handleSubmit"), index.indexOf("function renderThanks"));
if (!submitHandler.includes("const f = C.form;")) {
  throw new Error("Submit handler must define form configuration in its own scope.");
}
if (!submitHandler.includes("const usesImplicitConsent = Boolean(variantConfig.implicitConsent);")) {
  throw new Error("Submit handler must define route-specific implicit consent in its own scope.");
}

for (const needle of ["ydufwdgd3z", "showLander", "showProof", "metaLeadEvent", "Family-Owned", "Serving Charlotte & Surrounding Areas", "Wood · Vinyl · Aluminum · Chain Link"]) {
  if (!config.includes(needle)) throw new Error(`Missing funnel configuration: ${needle}`);
}

for (const needle of ["eventPrefix}_path_", "eventPrefix}_start", "funnelVariantName", "eventID", "action_source: 'website'"]) {
  if (!index.includes(needle)) throw new Error(`Missing tracking capability: ${needle}`);
}

for (const removed of ["leadRouterUrl", "quiz_profile", "automated AI assistant", "call could not be started"]) {
  if (index.includes(removed) || config.includes(removed)) throw new Error(`Lead-router calling remains: ${removed}`);
}

const assetMatches = [...config.matchAll(/\$\{A_W_ASSET_BASE\}([^`"$,\s]+)/g)];
for (const [, assetPath] of assetMatches) {
  await stat(fileURLToPath(new URL(`assets/${assetPath}`, publicDir)));
}

if (!index.includes('document.write(\'<script src="./config.js">')) {
  throw new Error("Missing nested VS Code preview config fallback.");
}

await stat(new URL("a/index.html", distDir));
await stat(new URL("b/index.html", distDir));
await stat(new URL("c/index.html", distDir));
await stat(new URL("d/index.html", distDir));
await stat(new URL("e/index.html", distDir));
console.log(`Validated ${assetMatches.length} configured asset references.`);
