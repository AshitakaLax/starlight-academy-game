import { createHash } from "node:crypto";
import {
  copyFile, mkdir, readFile, readdir, rm, stat, writeFile
} from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = path.join(root, "dist");
const sourceHtmlPath = path.join(distDirectory, "starlight-academy.html");

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function validateStandaloneHtml(html, { chapterCount = 10, sideQuestCount = 20 } = {}) {
  if (typeof html !== "string" || html.length < 100_000) {
    throw new TypeError("Release HTML is missing or unexpectedly small.");
  }
  if (!/^<!doctype html>/i.test(html.trimStart())) {
    throw new Error("Release HTML must begin with a doctype.");
  }
  if (!/<title>Starlight Academy: Studio of Magic &(?:amp;)? Motion<\/title>/i.test(html)) {
    throw new Error("Release HTML is missing the Starlight Academy document title.");
  }
  if (!/id=["']app["']/.test(html)) {
    throw new Error("Release HTML is missing the application mount point.");
  }
  if (/<script\b[^>]*\bsrc\s*=/i.test(html)) {
    throw new Error("Release HTML contains an external script reference.");
  }
  if (/<link\b[^>]*\bhref\s*=/i.test(html)) {
    throw new Error("Release HTML contains an external stylesheet or resource link.");
  }
  if (/<(?:img|source|iframe|audio|video)\b[^>]*\b(?:src|href)\s*=/i.test(html)) {
    throw new Error("Release HTML contains an external media/resource reference.");
  }
  if (/\b(?:src|href)\s*=\s*["'](?:https?:)?\/\//i.test(html)
      || /@import\s+(?:url\()?\s*["']?https?:/i.test(html)
      || /url\(\s*["']?https?:/i.test(html)) {
    throw new Error("Release HTML contains a remote runtime URL.");
  }
  if (/%INLINE_(?:CSS|JS)%/.test(html)) {
    throw new Error("Release HTML contains an unexpanded build-template marker.");
  }
  if ((html.match(/<style>/gi) ?? []).length !== 1
      || (html.match(/<script>/gi) ?? []).length !== 1) {
    throw new Error("Release HTML must contain exactly one inline style and one inline script bundle.");
  }
  if (!html.includes("The Grand Starlight Championship")
      || !html.includes("The Firefly Gap Maze")
      || !html.includes("The Grand Constellation Planner")
      || !html.includes("The Starlight Skill Matchmaker")) {
    throw new Error("Release HTML is missing required finale or side-quest content.");
  }
  if (chapterCount !== 10 || sideQuestCount !== 20) {
    throw new Error("Release manifest must declare all 10 chapters and 20 optional quests.");
  }
  return Object.freeze({
    htmlBytes: Buffer.byteLength(html),
    inlineStyles: 1,
    inlineScripts: 1,
    chapterCount,
    sideQuestCount,
    remoteRuntimeResources: 0
  });
}

async function readProjectMetadata() {
  const [packageText, releaseText] = await Promise.all([
    readFile(path.join(root, "package.json"), "utf8"),
    readFile(path.join(root, "src", "data", "release-manifest.json"), "utf8")
  ]);
  const pkg = JSON.parse(packageText);
  const release = JSON.parse(releaseText).release;
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version)) {
    throw new Error("package.json must contain a semantic release version.");
  }
  if (release.chapterCount !== 10 || release.sideQuestCount !== 20 || release.offline !== true) {
    throw new Error("The release manifest must describe the complete offline academy.");
  }
  return { pkg, release };
}

function gitText(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

async function createPackage() {
  const { pkg, release } = await readProjectMetadata();
  const html = await readFile(sourceHtmlPath, "utf8");
  const validation = validateStandaloneHtml(html, {
    chapterCount: release.chapterCount,
    sideQuestCount: release.sideQuestCount
  });
  const version = pkg.version;
  const directory = path.join(distDirectory, "release-v" + version);
  const htmlName = "starlight-academy-v" + version + ".html";
  const sourceName = "starlight-academy-source-v" + version + ".zip";
  const htmlPath = path.join(directory, htmlName);
  const sourcePath = path.join(directory, sourceName);
  const manifestPath = path.join(directory, "release-manifest.json");
  const readmePath = path.join(directory, "RELEASE-README.txt");
  const checksumsPath = path.join(directory, "SHA256SUMS.txt");

  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
  await copyFile(sourceHtmlPath, htmlPath);

  // The source ZIP is an exact snapshot of the tested commit, not a working-tree
  // copy containing build products, dependencies, or machine-specific files.
  execFileSync("git", [
    "archive", "--format=zip", "--output", sourcePath, "HEAD"
  ], { cwd: root, stdio: "inherit" });

  const commit = process.env.GITHUB_SHA || gitText(["rev-parse", "HEAD"]);
  const committedAt = gitText(["log", "-1", "--format=%cI", "HEAD"]);
  const htmlBytes = await readFile(htmlPath);
  const sourceBytes = await readFile(sourcePath);
  const manifest = {
    application: pkg.name,
    title: "Starlight Academy: Studio of Magic & Motion",
    version,
    releaseId: "starlight-academy-v" + version,
    sourceCommit: commit,
    sourceCommitDate: committedAt,
    format: "single-file-offline-html",
    offline: true,
    targetBrowsers: release.platforms,
    chapterCount: release.chapterCount,
    sideQuestCount: release.sideQuestCount,
    validation,
    files: [
      { name: htmlName, bytes: htmlBytes.length, sha256: digest(htmlBytes), kind: "standalone-game" },
      { name: sourceName, bytes: sourceBytes.length, sha256: digest(sourceBytes), kind: "source-project" }
    ]
  };

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  await writeFile(readmePath, [
    "STARLIGHT ACADEMY — VERSION " + version,
    "",
    "GAME",
    "  " + htmlName,
    "  Open this file directly in desktop Google Chrome or Microsoft Edge.",
    "  It is a complete offline game; no sibling assets or web server are required.",
    "",
    "SOURCE PROJECT",
    "  " + sourceName,
    "  ZIP snapshot of the exact source commit listed in release-manifest.json.",
    "  Requires Node.js 20 or newer. Run npm install, npm run check, npm test,",
    "  and npm run build to validate and rebuild the project.",
    "",
    "VERIFICATION",
    "  SHA256SUMS.txt contains checksums for all release files except itself.",
    "  Verify each file with sha256sum -c SHA256SUMS.txt (or an equivalent tool).",
    "",
    "CONTENTS",
    "  10 chapters, 20 optional side quests, Quest Board, pets, wardrobe,",
    "  gymnastics, curriculum hints, save/load, and JSON backup import/export.",
    ""
  ].join("\n"), "utf8");

  const checksumNames = [htmlName, sourceName, "release-manifest.json", "RELEASE-README.txt"];
  const checksumLines = [];
  for (const name of checksumNames) {
    const bytes = await readFile(path.join(directory, name));
    checksumLines.push(digest(bytes) + "  " + name);
  }
  await writeFile(checksumsPath, checksumLines.join("\n") + "\n", "utf8");

  const verified = await verifyPackage(directory);
  console.log("Packaged Starlight Academy v" + version + " at " + directory);
  console.log("Validated " + verified.fileCount + " release files, " + validation.htmlBytes + " HTML bytes.");
  console.log("Source commit: " + commit);
  return { directory, manifest, verified };
}

export async function verifyPackage(directory) {
  const entries = (await readdir(directory)).sort();
  const required = [
    "RELEASE-README.txt",
    "SHA256SUMS.txt",
    "release-manifest.json"
  ];
  for (const name of required) {
    if (!entries.includes(name)) throw new Error("Release package is missing " + name + ".");
  }
  const manifest = JSON.parse(await readFile(path.join(directory, "release-manifest.json"), "utf8"));
  const htmlEntry = manifest.files?.find((file) => file.kind === "standalone-game");
  const sourceEntry = manifest.files?.find((file) => file.kind === "source-project");
  if (!htmlEntry || !sourceEntry) throw new Error("Release manifest must identify the HTML and source archive.");
  const htmlBytes = await readFile(path.join(directory, htmlEntry.name));
  const sourceBytes = await readFile(path.join(directory, sourceEntry.name));
  if (digest(htmlBytes) !== htmlEntry.sha256 || htmlBytes.length !== htmlEntry.bytes) {
    throw new Error("Standalone HTML checksum or size does not match release-manifest.json.");
  }
  if (digest(sourceBytes) !== sourceEntry.sha256 || sourceBytes.length !== sourceEntry.bytes) {
    throw new Error("Source archive checksum or size does not match release-manifest.json.");
  }
  validateStandaloneHtml(htmlBytes.toString("utf8"), {
    chapterCount: manifest.chapterCount,
    sideQuestCount: manifest.sideQuestCount
  });

  const checksumText = await readFile(path.join(directory, "SHA256SUMS.txt"), "utf8");
  const checksumLines = checksumText.trim().split(/\r?\n/);
  const checksumMap = new Map(checksumLines.map((line) => {
    const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
    if (!match) throw new Error("SHA256SUMS.txt contains an invalid line: " + line);
    return [match[2], match[1]];
  }));
  for (const name of [...required, htmlEntry.name, sourceEntry.name].filter((name) => name !== "SHA256SUMS.txt")) {
    if (!checksumMap.has(name)) throw new Error("SHA256SUMS.txt is missing " + name + ".");
    const bytes = await readFile(path.join(directory, name));
    if (digest(bytes) !== checksumMap.get(name)) throw new Error("Checksum mismatch: " + name);
  }
  if (checksumMap.size !== required.length - 1 + 2) {
    throw new Error("SHA256SUMS.txt has an unexpected number of entries.");
  }

  return Object.freeze({
    directory,
    version: manifest.version,
    htmlName: htmlEntry.name,
    sourceName: sourceEntry.name,
    fileCount: entries.length,
    htmlBytes: htmlBytes.length,
    sourceBytes: sourceBytes.length,
    checksumEntries: checksumMap.size
  });
}

async function main() {
  const { pkg } = await readProjectMetadata();
  const directory = path.join(distDirectory, "release-v" + pkg.version);
  if (process.argv.includes("--verify")) {
    const result = await verifyPackage(directory);
    console.log("Release package v" + result.version + " verified: "
      + result.fileCount + " files, " + result.checksumEntries + " checksums.");
  } else {
    await createPackage();
  }
}

const invokedDirectly = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (invokedDirectly) {
  main().catch((error) => {
    console.error("Starlight Academy release packaging failed:", error);
    process.exitCode = 1;
  });
}
