import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(workspaceRoot, ".env") });

const args = process.argv.slice(2);

function printDevInfo() {
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    try {
      const envFile = readFileSync(path.join(workspaceRoot, ".env"), "utf8");
      const match = envFile.match(/^DATABASE_URL\s*=\s*["']?(.+?)["']?\s*$/m);
      if (match) databaseUrl = match[1];
    } catch {}
  }

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      const port = url.port || "5432";
      console.log(`\x1b[36m[db]\x1b[0m postgres → ${url.hostname}:${port}${url.pathname}`);
    } catch {}
  }
}

if (args.length === 0) {
  console.error("Usage: node scripts/run-turbo.mjs <task> [...turbo args]");
  process.exit(1);
}

if (args[0] === "dev") setTimeout(printDevInfo, 3000);

const child = spawn("pnpm", ["exec", "turbo", "run", ...args], {
  cwd: workspaceRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
