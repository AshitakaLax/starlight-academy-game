import { build, transform } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(projectRoot, "dist", "starlight-academy.html");
const templatePath = path.join(projectRoot, "build", "index.template.html");
const cssPath = path.join(projectRoot, "src", "ui", "styles.css");
const entryPath = path.join(projectRoot, "src", "browser-entry.js");

function assertSingleFileOfflineHtml(html) {
  const failures = [
    [/<script\b[^>]*\bsrc\s*=/i, "External script reference found."],
    [/<link\b[^>]*\bhref\s*=/i, "External stylesheet/resource link found."],
    [/\b(?:src|href)\s*=\s*["'](?:https?:)?\/\//i, "Remote resource URL found."],
    [/@import\s+(?:url\()?\s*["']?https?:/i, "Remote CSS import found."],
    [/url\(\s*["']?https?:/i, "Remote CSS URL found."],
    [/%INLINE_(?:CSS|JS)%/, "Unreplaced build placeholder found."]
  ];
  for (const [pattern, message] of failures) {
    if (pattern.test(html)) throw new Error("Offline HTML validation failed: " + message);
  }
  if (!/^<!doctype html>/i.test(html.trimStart())) {
    throw new Error("Offline HTML validation failed: missing HTML doctype.");
  }
  if (!html.includes('id="app"')) {
    throw new Error("Offline HTML validation failed: missing application mount point.");
  }
  if (!html.includes("<style>") || !html.includes("<script>")) {
    throw new Error("Offline HTML validation failed: inline style or script bundle missing.");
  }
}

/** Build an offline, single-file HTML artifact from the modular source project. */
export async function buildGame({ write = true } = {}) {
  const [templateSource, cssSource] = await Promise.all([
    readFile(templatePath, "utf8"),
    readFile(cssPath, "utf8")
  ]);

  if (templateSource.split("%INLINE_CSS%").length !== 2 || templateSource.split("%INLINE_JS%").length !== 2) {
    throw new Error("HTML template must contain exactly one CSS and one JS insertion point.");
  }

  const [javascript, css] = await Promise.all([
    build({
      absWorkingDir: projectRoot,
      entryPoints: [entryPath],
      bundle: true,
      platform: "browser",
      format: "iife",
      target: ["chrome110", "edge110"],
      write: false,
      minify: true,
      legalComments: "none",
      charset: "utf8",
      loader: { ".svg": "text", ".json": "json" },
      metafile: true
    }),
    transform(cssSource, {
      loader: "css",
      target: ["chrome110", "edge110"],
      minify: true
    })
  ]);

  if (javascript.outputFiles.length !== 1) {
    throw new Error("Expected one JavaScript bundle; received " + javascript.outputFiles.length + ".");
  }

  const inlineJs = javascript.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
  const inlineCss = css.code.replace(/<\/style/gi, "<\\/style");
  const html = templateSource
    .replace("%INLINE_CSS%", inlineCss)
    .replace("%INLINE_JS%", inlineJs);

  assertSingleFileOfflineHtml(html);
  if (write) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html, "utf8");
  }

  return {
    html,
    outputPath: write ? outputPath : null,
    javascriptBytes: Buffer.byteLength(inlineJs),
    cssBytes: Buffer.byteLength(inlineCss),
    inputFiles: Object.keys(javascript.metafile.inputs)
  };
}

const invokedDirectly = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (invokedDirectly) {
  try {
    const result = await buildGame();
    console.log("Built " + result.outputPath);
    console.log("Embedded " + result.inputFiles.length + " JavaScript inputs, " + result.javascriptBytes + " JS bytes, and " + result.cssBytes + " CSS bytes.");
    console.log("Validated: one HTML file, inline CSS/JS, no remote runtime resources.");
  } catch (error) {
    console.error("Starlight Academy build failed:", error);
    process.exitCode = 1;
  }
}
