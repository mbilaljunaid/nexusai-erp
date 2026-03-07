import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * FIX: Category AF (Part 2) — Remaining bg-*-50 Usages
 *
 * Converts all remaining raw Tailwind bg-{color}-50 classes to opacity-based
 * design tokens that render correctly in dark mode:
 *
 *   bg-{color}-50        →  bg-{color}-500/10
 *   hover:bg-{color}-50  →  hover:bg-{color}-500/10
 *   hover:bg-{color}-100 →  hover:bg-{color}-500/15
 *
 * Special cases:
 *   bg-slate-50 / bg-gray-50 / bg-zinc-50 as FULL PAGE backgrounds
 *   (min-h-screen or wrapping page containers) are left at /5 opacity —
 *   using bg-muted/50 is the right semantic token for page scaffolding.
 *
 * Run: npx tsx scripts/fix_category_af_part2.ts
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

// Colors that have a 500 milestone in Tailwind
const COLORS = [
    "blue", "green", "red", "rose", "purple", "violet", "indigo",
    "amber", "orange", "teal", "cyan", "emerald", "slate", "gray",
    "zinc", "stone", "yellow", "lime", "sky", "fuchsia", "pink",
];

// Build the pattern: bg-{color}-50 followed by a non-digit/non-slash char
// (avoids hitting bg-blue-500/10 which we already placed, or bg-blue-50/50)
function buildReplacements(): Array<[RegExp, string]> {
    const pairs: Array<[RegExp, string]> = [];
    for (const color of COLORS) {
        // Plain: bg-{color}-50 (not followed by another digit or /)
        pairs.push([
            new RegExp(`(?<![a-zA-Z])bg-${color}-50(?![0-9/])`, "g"),
            `bg-${color}-500/10`,
        ]);
        // hover: prefix
        pairs.push([
            new RegExp(`hover:bg-${color}-50(?![0-9/])`, "g"),
            `hover:bg-${color}-500/10`,
        ]);
        // hover:bg-{color}-100 → hover:bg-{color}-500/15
        pairs.push([
            new RegExp(`hover:bg-${color}-100(?![0-9/])`, "g"),
            `hover:bg-${color}-500/15`,
        ]);
    }
    return pairs;
}

const REPLACEMENTS = buildReplacements();

// Detect full-page scaffold backgrounds that should NOT become transparent
const PAGE_BG_REGEX = /(?:min-h-screen|min-h-\[|space-y-\d+\s+bg-(?:slate|gray|zinc)-50|bg-(?:slate|gray|zinc)-50\s+min-h)/;

function processFile(content: string): { result: string; count: number } {
    // If this file uses slate/gray/zinc-50 as a page background, skip colour
    // replacements for those three neutrals only — use bg-muted instead.
    const hasPageBg = PAGE_BG_REGEX.test(content);

    let result = content;
    let count = 0;

    for (const [regex, replacement] of REPLACEMENTS) {
        const color = regex.source.match(/bg-([a-z]+)-/)?.[1];
        // For page-background files, skip neutral page-scaffold colors
        if (hasPageBg && ["slate", "gray", "zinc"].includes(color ?? "")) {
            // Replace only if NOT immediately preceded by a quote/space suggesting
            // it's a standalone class (not part of a longer string).
            // We handle this by replacing but then restoring page bg instances.
            const before = result;
            result = result.replace(regex, replacement);
            const afterCount = (before.match(regex) ?? []).length;
            count += afterCount;
            // Restore min-h-screen page backgrounds to bg-muted/50
            result = result.replace(
                new RegExp(`bg-${color}-500\\/10(\\s+min-h|" min-h)`, "g"),
                `bg-muted/50$1`
            );
            result = result.replace(
                new RegExp(`(min-h-screen\\s+)bg-${color}-500\\/10`, "g"),
                `$1bg-muted/50`
            );
            continue;
        }

        const before = result;
        result = result.replace(regex, replacement);
        count += (before.match(regex) ?? []).length;
    }

    return { result, count };
}

function walkSync(dir: string, filelist: string[] = []): string[] {
    if (!fs.existsSync(dir)) return filelist;
    for (const file of fs.readdirSync(dir)) {
        const fp = path.join(dir, file);
        if (fs.statSync(fp).isDirectory()) {
            if (fp.includes("node_modules") || fp.includes("src/components/ui")) continue;
            filelist = walkSync(fp, filelist);
        } else if (fp.endsWith(".tsx") || fp.endsWith(".ts")) {
            filelist.push(fp);
        }
    }
    return filelist;
}

const TARGET_DIRS = [
    path.join(ROOT, "src/pages"),
    path.join(ROOT, "src/components"),
];

let totalFixed = 0;
let filesModified = 0;

for (const dir of TARGET_DIRS) {
    for (const file of walkSync(dir)) {
        const original = fs.readFileSync(file, "utf8");
        const { result, count } = processFile(original);

        if (count > 0 && result !== original) {
            fs.writeFileSync(file, result, "utf8");
            totalFixed += count;
            filesModified++;
            const rel = file.split("/src/")[1];
            console.log(`✓ ${rel} — ${count} fix(es)`);
        }
    }
}

console.log(`\n╔══════════════════════════════════════════════╗`);
console.log(`║   Category AF Part 2 Complete                ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║  bg-*-50 tokens fixed  : ${String(totalFixed).padEnd(18)}║`);
console.log(`║  Files modified        : ${String(filesModified).padEnd(18)}║`);
console.log(`╚══════════════════════════════════════════════╝`);
console.log(`\nNext step: npx tsc --noEmit`);
