import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const root = path.resolve(process.cwd(), "src");
const port = Number(process.env.PORT || 5173);

const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
};

http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  let filePath = path.join(root, parsed.pathname === "/" ? "index.html" : parsed.pathname);
  if (!filePath.startsWith(root)) { res.statusCode = 403; res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.statusCode = 404; res.end("Not found"); return; }
    const ext = path.extname(filePath);
    res.setHeader("Content-Type", mime[ext] || "application/octet-stream");
    res.end(data);
  });
}).listen(port, () => console.log(`Dev server at http://localhost:${port}`));
