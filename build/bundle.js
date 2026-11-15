import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("dist");
fs.mkdirSync(outDir, { recursive: true });
// clean dist
for (const f of fs.readdirSync(outDir)) fs.rmSync(path.join(outDir, f), { recursive: true, force: true });

// Bundle all JS into memory (single IIFE, no sibling chunks)
const jsResult = await build({
  entryPoints: ["src/app/bootstrap.js"],
  bundle: true,
  format: "iife",
  globalName: "StarlightApp",
  platform: "browser",
  target: ["chrome100", "edge100"],
  minify: false,
  sourcemap: false,
  write: false,
  logLevel: "silent",
  loader: { ".svg": "text", ".png": "dataurl", ".json": "json" },
});
const jsCode = jsResult.outputFiles[0].text;

// Collect and inline all CSS
const cssFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".css")) cssFiles.push(full);
  }
}
walk("src");
const cssCode = cssFiles
  .sort()
  .map((f) => `/* ${path.relative(process.cwd(), f)} */\n${fs.readFileSync(f, "utf8")}`)
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Starlight Academy: Studio of Magic & Motion</title>
<style>${cssCode}</style>
</head>
<body>
<div id="app" class="app-root"></div>
<script>${jsCode}</script>
<script>if (window.StarlightApp && StarlightApp.bootstrap) { StarlightApp.bootstrap("#app").catch(function(e){console.error(e);document.body.innerHTML="<pre>"+(e&&e.stack||e)+"</pre>";}); }</script>
</body>
</html>`;

const outFile = path.join(outDir, "index.html");
fs.writeFileSync(outFile, html);
console.log("Built", outFile);
console.log("CSS files inlined:", cssFiles.length);
