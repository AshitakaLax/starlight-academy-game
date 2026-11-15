import fs from "node:fs";
import path from "node:path";

const file = path.resolve("dist", "index.html");
if (!fs.existsSync(file)) {
  console.error("Missing dist/index.html");
  process.exit(1);
}
const html = fs.readFileSync(file, "utf8");

// Single file check: no sibling asset references
const issues = [];
if (/src\s*=\s*["'][^"']+\.(js|css|svg|png|jpg|json)["']/i.test(html)) issues.push("external src asset reference");
if (/href\s*=\s*["'][^"']+\.(css|js)["']/i.test(html)) issues.push("external href asset reference");
if (/https?:\/\//i.test(html)) issues.push("runtime network URL detected");

// Must contain inlined script
if (!html.includes("<script>")) issues.push("no inlined script");

if (issues.length) {
  console.error("Validation failed:", issues.join("; "));
  process.exit(1);
}
console.log("Validation passed: single standalone HTML, no external asset references.");
