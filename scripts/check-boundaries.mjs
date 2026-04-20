import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const rules = [
  {
    scope: "web",
    root: path.join(workspaceRoot, "apps/web"),
    bannedBareSpecifiers: [
      "@colonels-academy/api",
      "@colonels-academy/worker",
      "@colonels-academy/database"
    ],
    bannedResolvedPrefixes: [
      path.join(workspaceRoot, "apps/api"),
      path.join(workspaceRoot, "apps/worker"),
      path.join(workspaceRoot, "packages/database")
    ]
  },
  {
    scope: "api",
    root: path.join(workspaceRoot, "apps/api"),
    bannedBareSpecifiers: ["@colonels-academy/web"],
    bannedResolvedPrefixes: [path.join(workspaceRoot, "apps/web")]
  },
  {
    scope: "worker",
    root: path.join(workspaceRoot, "apps/worker"),
    bannedBareSpecifiers: ["@colonels-academy/web"],
    bannedResolvedPrefixes: [path.join(workspaceRoot, "apps/web")]
  },
  {
    scope: "mobile",
    root: path.join(workspaceRoot, "apps/mobile"),
    bannedBareSpecifiers: [
      "@colonels-academy/api",
      "@colonels-academy/worker",
      "@colonels-academy/database"
    ],
    bannedResolvedPrefixes: [
      path.join(workspaceRoot, "apps/api"),
      path.join(workspaceRoot, "apps/worker"),
      path.join(workspaceRoot, "packages/database")
    ]
  }
];

const sourceExtensions = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);
const importPattern =
  /\b(?:import|export)\s[^"']*?\bfrom\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)|\brequire\(\s*["']([^"']+)["']\s*\)/g;

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".next") {
      continue;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(entryPath)));
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function normalizeSpecifier(specifier) {
  return specifier.replace(/\\/g, "/");
}

function matchesBareSpecifier(specifier, bannedBareSpecifiers) {
  return bannedBareSpecifiers.some(
    (candidate) => specifier === candidate || specifier.startsWith(`${candidate}/`)
  );
}

function matchesResolvedPath(filePath, specifier, bannedResolvedPrefixes) {
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
    return false;
  }

  const resolved = path.resolve(path.dirname(filePath), specifier);

  return bannedResolvedPrefixes.some((prefix) => resolved.startsWith(prefix));
}

async function checkRule(rule) {
  const files = await collectSourceFiles(rule.root);
  const violations = [];

  for (const file of files) {
    const contents = await readFile(file, "utf8");

    for (const match of contents.matchAll(importPattern)) {
      const specifier = normalizeSpecifier(match[1] ?? match[2] ?? match[3] ?? "");

      if (!specifier) {
        continue;
      }

      if (
        matchesBareSpecifier(specifier, rule.bannedBareSpecifiers) ||
        matchesResolvedPath(file, specifier, rule.bannedResolvedPrefixes)
      ) {
        violations.push({
          file: path.relative(workspaceRoot, file),
          specifier
        });
      }
    }
  }

  return violations;
}

const results = await Promise.all(rules.map(checkRule));
const violations = results.flat();

if (violations.length > 0) {
  console.error("Import boundary violations found:");

  for (const violation of violations) {
    console.error(`- ${violation.file} imports "${violation.specifier}"`);
  }

  process.exit(1);
}

console.log("Import boundaries passed.");
