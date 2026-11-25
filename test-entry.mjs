// TDD-lite checks for the Unsent micro-confession entry.
// Run: node test-entry.mjs   (from this directory)
// Checks, per kit gate + judge brief:
//  1. main.ts exists and imports stdlib only (node:*).
//  2. Two runs with MAKEFUN_OUTPUT_DIR to different temp dirs give identical entry.txt.
//  3. entry.txt is UTF-8, 1-260 chars, not only whitespace.
//  4. Entry is two parts: a "To:" line, then exactly one unsent line.
//  5. The unsent line is at most 200 chars (judge brief cap).
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
let failures = 0;
function check(name, ok, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
  if (!ok) failures++;
}

const mainTs = join(dir, "main.ts");
check("main.ts exists", existsSync(mainTs));
if (existsSync(mainTs)) {
  const src = readFileSync(mainTs, "utf8");
  const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  const nonStd = imports.filter((i) => !i.startsWith("node:"));
  check("stdlib-only imports", nonStd.length === 0, `imports: ${imports.join(", ") || "(none)"}`);
}

function runOnce() {
  const out = mkdtempSync(join(dir, ".verify-"));
  try {
    execFileSync(process.execPath, ["main.ts"], {
      cwd: dir,
      env: { ...process.env, MAKEFUN_OUTPUT_DIR: out, MAKEFUN_INPUT_DIR: join(dir, ".verify-input") },
      stdio: "pipe",
    });
    return readFileSync(join(out, "entry.txt"), "utf8");
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

let first = null;
let second = null;
try {
  first = runOnce();
  second = runOnce();
} catch (e) {
  check("main.ts runs cleanly", false, String(e.message).split("\n")[0]);
}
if (first !== null) {
  check("deterministic (two runs identical)", first === second);
  const chars = [...first].length;
  check("gate: 1-260 chars", chars >= 1 && chars <= 260, `${chars} chars`);
  check("gate: not only whitespace", first.trim().length > 0);
  const lines = first.replace(/\n$/, "").split("\n");
  check("two parts: To: line + one line", lines.length === 2 && lines[0].startsWith("To: "), JSON.stringify(first));
  if (lines.length === 2) {
    const msgChars = [...lines[1]].length;
    check("unsent line <= 200 chars", msgChars <= 200, `${msgChars} chars`);
    check("unsent line non-empty", lines[1].trim().length > 0);
  }
}

if (failures > 0) {
  console.log(`${failures} check(s) failed`);
  process.exit(1);
}
console.log("All checks passed");
