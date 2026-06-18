const fs = require("fs");
const path = require("path");

const backendUrl = process.env.VERCEL_BACKEND_URL || process.env.BACKEND_URL || "";
const outputPath = path.join(__dirname, "..", "frontend", "env.js");

fs.writeFileSync(
  outputPath,
  `window.QUALIFLOW_API_BASE = ${JSON.stringify(backendUrl.replace(/\/$/, ""))};\n`,
  "utf8"
);
