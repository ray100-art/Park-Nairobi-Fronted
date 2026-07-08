/**
 * Netlify build step: writes js/config.js from API_BASE env var.
 * Set API_BASE in Netlify → Site settings → Environment variables
 * to your Railway/Render backend URL, e.g. https://xxx.up.railway.app
 */
const fs = require("fs");
const path = require("path");

const apiBase = (process.env.API_BASE || "").replace(/\/$/, "");
const out = path.join(__dirname, "js", "config.js");

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
  out,
  `// Generated at build time — do not edit by hand on Netlify\n` +
    `window.__API_BASE__ = window.__API_BASE__ || ${JSON.stringify(apiBase)};\n`
);

console.log("Wrote js/config.js with API_BASE =", apiBase || "(empty — same-origin / local fallback)");
