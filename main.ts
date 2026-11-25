// Unsent: The Micro-Confession Sprint
// Writes the two-part micro-confession to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Node 22, stdlib-only, deterministic: the entry is a fixed string.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the repo dir from this script's location, never from process.cwd().
const repoDir = dirname(fileURLToPath(import.meta.url));
void repoDir;

const inputDir = process.env.MAKEFUN_INPUT_DIR ?? "/input";
void inputDir;

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The entry, exactly as typed: a To: line naming who it was meant for,
// then the one unsent line itself. No explanation after it.
const ENTRY =
  'To: Ucup\n' +
  'I saved your 2 a.m. "gas" — the first time you sounded proud of me.\n';

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
