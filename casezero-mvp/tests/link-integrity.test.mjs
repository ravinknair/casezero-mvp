import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const appDirectory = path.resolve("app");
const sourceDirectories = [appDirectory, path.resolve("components"), path.resolve("lib")];

async function collectFiles(directory, fileNames) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(entryPath, fileNames)));
    if (entry.isFile() && fileNames.some((name) => entry.name.endsWith(name))) files.push(entryPath);
  }

  return files;
}

function toRoute(filePath, suffix) {
  const relativePath = path.relative(appDirectory, filePath).replaceAll(path.sep, "/");
  const route = relativePath.slice(0, -suffix.length).replace(/\/\([^/]+\)/g, "");
  return `/${route}`.replace(/\/index$/, "").replace(/\/$/, "") || "/";
}

function routeMatches(target, route) {
  const targetParts = target.split("/").filter(Boolean);
  const routeParts = route.split("/").filter(Boolean);
  if (targetParts.length !== routeParts.length) return false;
  return routeParts.every((part, index) => /^\[.+\]$/.test(part) || part === targetParts[index]);
}

test("hard-coded internal links and API calls resolve to application routes", async () => {
  const pageFiles = await collectFiles(appDirectory, ["page.tsx", "page.ts", "page.jsx", "page.js"]);
  const apiFiles = await collectFiles(path.join(appDirectory, "api"), ["route.ts", "route.js"]);
  const sourceFiles = (await Promise.all(sourceDirectories.map((directory) => collectFiles(directory, [".ts", ".tsx", ".js", ".jsx"])))).flat();
  const pageRoutes = pageFiles.map((filePath) => toRoute(filePath, path.basename(filePath)));
  const apiRoutes = apiFiles.map((filePath) => toRoute(filePath, path.basename(filePath)));
  const missingTargets = [];
  const targetPattern = /(?:href\s*=\s*|href:\s*|window\.open\(\s*|router\.(?:push|replace)\(\s*|fetch\(\s*)["'](\/[a-zA-Z0-9_?=&/.-]+)["']/g;

  for (const filePath of sourceFiles) {
    const source = await readFile(filePath, "utf8");
    for (const match of source.matchAll(targetPattern)) {
      const target = match[1].split("?")[0].replace(/\/$/, "") || "/";
      const availableRoutes = target.startsWith("/api/") ? apiRoutes : pageRoutes;
      if (!availableRoutes.some((route) => routeMatches(target, route))) {
        missingTargets.push(`${path.relative(process.cwd(), filePath)} -> ${target}`);
      }
    }
  }

  assert.deepEqual(missingTargets, []);
});