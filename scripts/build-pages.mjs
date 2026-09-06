import { cp, mkdir, rm, copyFile } from "node:fs/promises";

const publicDir = new URL("../public/", import.meta.url);
const distDir = new URL("../dist/", import.meta.url);

await rm(distDir, { recursive: true, force: true });
await cp(publicDir, distDir, { recursive: true });

for (const route of ["a", "b", "c"]) {
  const routeDir = new URL(`${route}/`, distDir);
  await mkdir(routeDir, { recursive: true });
  await copyFile(new URL("index.html", distDir), new URL("index.html", routeDir));
}

console.log("Built Cloudflare Pages output with /a, /b, and /c route entries.");
