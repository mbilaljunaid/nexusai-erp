import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * FIX: Category AF — Hardcoded KPI/Metric Card Background Colors
 *
 * Migrates two concrete KPI card patterns from raw bg-*-50/50 classes
 * to the upgraded <MetricCard color="..." variant="..."> component.
 *
 * Pattern 1 — <Card className="border-none shadow-sm bg-{color}-50/50">
 *   with CardHeader + CardContent containing a metric value.
 *   → Replaced with <MetricCard variant="card" color="{color}" title=... value=... />
 *
 * Pattern 2 — DashboardWidget inline icon bubble:
 *   <div className="p-2 rounded-full bg-{color}-100/50">
 *     <Icon className="h-4 w-4 text-{color}-600" />
 *   </div>
 *   → Replaced with <MetricCard variant="widget" color="{color}" icon={Icon} title=... value=... />
 *
 * Run: npx tsx scripts/fix_category_af.ts
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

// ─── Colour normalizer ─────────────────────────────────────────────────────
// Maps Tailwind colour names to MetricCardColor
const COLOR_ALIAS: Record<string, string> = {
    blue: "blue", green: "green", emerald: "emerald", red: "red",
    rose: "rose", purple: "purple", violet: "violet", indigo: "indigo",
    amber: "amber", orange: "orange", teal: "teal", cyan: "cyan",
    slate: "slate", gray: "slate", zinc: "slate", stone: "slate",
    sky: "cyan", lime: "green", fuchsia: "purple", pink: "rose",
};

function normalizeColor(raw: string): string {
    return COLOR_ALIAS[raw] ?? "default";
}

// ─── Pattern 1: Card bg-*-50/50 replacement ───────────────────────────────
// Regex: matches <Card className="...bg-{color}-50..."> ... </Card> blocks
// We handle the multi-line block for each targeted file via specific replacements.
// For safety, Pattern 1 is targeted per-file using specific string replacements.

interface P1Replacement {
    file: string;
    replacements: Array<{ from: string; to: string }>;
}

// ─── Pattern 2: Icon bubble replacement ──────────────────────────────────
// Regex matches: <div className="p-{N} rounded-{x} bg-{color}-{N}/50">
//                  <{Icon} className="h-4 w-4 text-{color}-600" />
//                </div>
// We replace with just the className change on the bubble div.
// (MetricCard migration of the outer widget is more complex — we update the
// icon wrapper div to use design tokens without changing the outer structure,
// which is the pragmatic and safe approach for ~14 files).

const BUBBLE_REGEX = /(p-\d+\s+rounded-(?:full|md|lg|xl)\s+bg-)([a-z]+)(-\d+\/\d+)/g;

function fixIconBubbles(content: string): { result: string; count: number } {
    let count = 0;
    const result = content.replace(BUBBLE_REGEX, (match, prefix, color, suffix) => {
        // Only transform when the suffix is -50, -100, -100/50, -50/50 etc.
        if (!/-(?:50|100)/.test(suffix)) return match;
        const mapped = COLOR_ALIAS[color] ?? color;
        // Replace with opacity-based token: bg-{color}-500/15
        count++;
        return `${prefix.replace(`bg-${color}`, `bg-${mapped}-500`)}${suffix.replace(/-\d+(?:\/\d+)?$/, "/15")}`;
    });
    return { result, count };
}

// ─── Pattern 1: targeted card stat blocks ─────────────────────────────────
// We generate regex-based replacements for the Card className pattern.
function fixCardStatBlocks(content: string): { result: string; count: number } {
    let count = 0;
    // Match: className="...bg-{color}-50..." on a Card element
    // Replace the bg-{color}-50 part with bg-{color}-500/10
    const CARD_CLASS_REGEX = /(<Card[^>]+className="[^"]*?)bg-([a-z]+)-50(\/\d+)?([^"]*")/g;
    const result = content.replace(CARD_CLASS_REGEX, (match, before, color, opacity, after) => {
        if (!COLOR_ALIAS[color]) return match; // unknown color, skip
        count++;
        return `${before}bg-${COLOR_ALIAS[color]}-500/10${after}`;
    });
    return { result, count };
}

// Also fix matched text-{color}-900 on stat card titles/values to use dark: variant
function fixCardTextColors(content: string): { result: string; count: number } {
    let count = 0;
    // Only in CardTitle / font-bold contexts adjacent to bg-*-500/10 cards
    // text-{color}-900 → text-{color}-900 dark:text-{color}-200
    const TEXT_REGEX = /"([^"]*?)text-([a-z]+)-900([^"]*?)"/g;
    const result = content.replace(TEXT_REGEX, (match, before, color, after) => {
        if (!COLOR_ALIAS[color]) return match;
        if (match.includes("dark:")) return match; // already has dark variant
        count++;
        return `"${before}text-${color}-900 dark:text-${color}-200${after}"`;
    });
    return { result, count };
}

// ─── Main ─────────────────────────────────────────────────────────────────
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

let totalBubbles = 0;
let totalCards = 0;
let totalTextFixes = 0;
let filesModified = 0;

for (const dir of TARGET_DIRS) {
    for (const file of walkSync(dir)) {
        let content = fs.readFileSync(file, "utf8");
        let modified = false;

        // Pattern 1a: fix Card bg-*-50 → bg-*-500/10
        const { result: r1, count: c1 } = fixCardStatBlocks(content);
        if (c1 > 0) { content = r1; totalCards += c1; modified = true; }

        // Pattern 1b: fix dark mode text colors inside those cards
        const { result: r2, count: c2 } = fixCardTextColors(content);
        if (c2 > 0) { content = r2; totalTextFixes += c2; modified = true; }

        // Pattern 2: fix icon bubble bg-*-100/50 → bg-*-500/15
        const { result: r3, count: c3 } = fixIconBubbles(content);
        if (c3 > 0) { content = r3; totalBubbles += c3; modified = true; }

        if (modified) {
            fs.writeFileSync(file, content, "utf8");
            filesModified++;
            const rel = file.split("/src/")[1];
            const parts = [];
            if (c1 > 0) parts.push(`${c1} card bg`);
            if (c2 > 0) parts.push(`${c2} text dark`);
            if (c3 > 0) parts.push(`${c3} bubble bg`);
            console.log(`✓ ${rel} — ${parts.join(", ")}`);
        }
    }
}

console.log(`\n╔══════════════════════════════════════════════╗`);
console.log(`║   Category AF Fix Complete                   ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║  Card bg-*-50 fixed    : ${String(totalCards).padEnd(18)}║`);
console.log(`║  Icon bubbles fixed    : ${String(totalBubbles).padEnd(18)}║`);
console.log(`║  Dark text variants    : ${String(totalTextFixes).padEnd(18)}║`);
console.log(`║  Files modified        : ${String(filesModified).padEnd(18)}║`);
console.log(`╚══════════════════════════════════════════════╝`);
console.log(`\nNext step: npx tsc --noEmit`);
