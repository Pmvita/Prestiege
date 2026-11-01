/**
 * Node 20+ lists `node:sea` in builtinModules. Expo 49 turns that into a
 * directory name, which Windows rejects (`:`). Drop colon-bearing ids.
 */
const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "@expo",
  "cli",
  "build",
  "src",
  "start",
  "server",
  "metro",
  "externals.js"
);

if (!fs.existsSync(target)) process.exit(0);

const src = fs.readFileSync(target, "utf8");
if (src.includes('!x.includes(":")')) process.exit(0);

const needle = '].includes(x)\n    ),';
const patched = '].includes(x) && !x.includes(":")\n    ),';
if (!src.includes(needle)) {
  console.warn("fix-expo-node-sea: pattern not found, skipping");
  process.exit(0);
}

fs.writeFileSync(target, src.replace(needle, patched));
console.log("fix-expo-node-sea: patched Expo externals for Windows");
