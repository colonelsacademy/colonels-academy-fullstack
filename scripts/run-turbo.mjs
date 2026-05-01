import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/run-turbo.mjs <task> [...turbo args]");
  process.exit(1);
}

const child = spawn("turbo", ["run", ...args], {
  cwd: workspaceRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    PATH: `${workspaceRoot}${path.delimiter}${process.env.PATH ?? ""}`
  }
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
