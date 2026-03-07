import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * FIX: Category AE — Debug console.* Statements in Production Code
 *
 * Removes all bare console.log / console.warn / console.error / console.debug / console.info
 * calls from src/pages/ and src/components/, with targeted exclusions for files where
 * console output is intentional and correct:
 *
 *   - src/components/examples/      — Demo/stub callback files (expected)
 *   - src/components/shared/ErrorBoundaries.tsx — Class error boundary lifecycle methods
 *
 * Strategy:
 *   Line-by-line scan. A line is removed if:
 *     1. It matches /console\.(log|warn|error|debug|info)\s*\(/ (the entire statement)
 *     2. It is NOT already commented out (/^\s*\/\//)
 *     3. The file is not in the exclusion list
 *
 *   Multi-line console calls (extremely rare) are handled by tracking open-paren depth.
 *
 * Run: npx tsx scripts/fix_category_ae.ts
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Exclusions ───────────────────────────────────────────────────────────────
const EXCLUDED_PATHS = [
    "src/components/examples/",         // stub callbacks in demo components
    "src/components/shared/ErrorBoundaries.tsx", // class lifecycle error logging
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isExcluded(filePath: string): boolean {
    return EXCLUDED_PATHS.some(excl => filePath.includes(excl));
}

function walkSync(dir: string, filelist: string[] = []): string[] {
    if (!fs.existsSync(dir)) return filelist;
    for (const file of fs.readdirSync(dir)) {
        const fp = path.join(dir, file);
        if (fs.statSync(fp).isDirectory()) {
            if (fp.includes("node_modules")) continue;
            filelist = walkSync(fp, filelist);
        } else if (fp.endsWith(".tsx") || fp.endsWith(".ts")) {
            filelist.push(fp);
        }
    }
    return filelist;
}

// Matches the start of a console call statement (not preceded by `//`)
const CONSOLE_START = /^\s*console\.(log|warn|error|debug|info)\s*\(/;
// Checks if a line is purely a comment
const COMMENT_LINE = /^\s*\/\//;

/**
 * Remove all console.* statement lines from content.
 * Tracks multi-line calls using parenthesis depth.
 */
function stripConsoleStatements(content: string): { result: string; removed: number } {
    const lines = content.split("\n");
    const output: string[] = [];
    let removed = 0;
    let inConsoleCall = false;
    let parenDepth = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (inConsoleCall) {
            // Count parens to find end of multi-line call
            for (const ch of line) {
                if (ch === "(") parenDepth++;
                else if (ch === ")") {
                    parenDepth--;
                    if (parenDepth === 0) {
                        inConsoleCall = false;
                        break;
                    }
                }
            }
            // Drop this continuation line too
            removed++;
            continue;
        }

        if (!COMMENT_LINE.test(line) && CONSOLE_START.test(line)) {
            // Count parens on this line to see if it closes on same line
            let depth = 0;
            for (const ch of line) {
                if (ch === "(") depth++;
                else if (ch === ")") {
                    depth--;
                }
            }
            removed++;
            if (depth > 0) {
                // Multi-line call — track continuation
                inConsoleCall = true;
                parenDepth = depth;
            }
            // Either way, don't push this line
            continue;
        }

        output.push(line);
    }

    return { result: output.join("\n"), removed };
}

// ─── Main ────────────────────────────────────────────────────────────────────
const TARGET_DIRS = [
    path.join(__dirname, "../src/pages"),
    path.join(__dirname, "../src/components"),
];

let totalRemoved = 0;
let filesModified = 0;

for (const dir of TARGET_DIRS) {
    const files = walkSync(dir);
    for (const file of files) {
        if (isExcluded(file)) continue;

        const original = fs.readFileSync(file, "utf8");
        const { result, removed } = stripConsoleStatements(original);

        if (removed > 0) {
            fs.writeFileSync(file, result, "utf8");
            totalRemoved += removed;
            filesModified++;
            const rel = file.split("/src/")[1];
            console.log(`✓ ${rel} — ${removed} console statement(s) removed`);
        }
    }
}

console.log(`\n╔══════════════════════════════════════════════╗`);
console.log(`║   Category AE Fix Complete                   ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║  Console statements removed: ${String(totalRemoved).padEnd(14)}║`);
console.log(`║  Files modified            : ${String(filesModified).padEnd(14)}║`);
console.log(`╚══════════════════════════════════════════════╝`);
console.log(`\nExclusions preserved:`);
console.log(`  ✓ src/components/examples/  (stub callbacks)`);
console.log(`  ✓ src/components/shared/ErrorBoundaries.tsx  (intentional)`);
console.log(`\nNext step: npx tsc --noEmit`);
