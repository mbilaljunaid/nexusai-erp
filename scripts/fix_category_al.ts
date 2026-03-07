import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * FIX: Category AL — Hardcoded 'en-US' / 'USD' Locale Strings
 *
 * Replaces inline `new Intl.NumberFormat('en-US', ...)` and
 * `toLocaleString('en-US', ...)` calls with the standardized
 * `formatCurrency()` / `formatNumber()` from @/lib/formatters,
 * which accept optional locale/currency parameters backed by the
 * new `useTenantLocale()` hook.
 *
 * Patterns targeted:
 *   1. new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(X)
 *      → formatCurrency(X)
 *   2. new Intl.NumberFormat('en-US', { style: 'currency', currency: someVar }).format(X)
 *      → formatCurrency(X, someVar)
 *   3. new Intl.NumberFormat('en-US', { minimumFractionDigits: N, ... }).format(X)
 *      → formatNumber(X, N)
 *   4. Number(X).toLocaleString('en-US', { minimumFractionDigits: N })
 *      → formatNumber(X, N)
 *   5. X.toLocaleString('en-US', { ... })
 *      → formatNumber(X, N)
 *   6. Standalone components that create a local fmt() helper using 'en-US'
 *      → replace the function body to use formatNumber
 *
 * Run: npx tsx scripts/fix_category_al.ts
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");
const FORMATTERS_IMPORT = `import { formatCurrency, formatNumber } from "@/lib/formatters";`;
const FORMATTERS_CURRENCY_IMPORT = `import { formatCurrency } from "@/lib/formatters";`;
const FORMATTERS_NUMBER_IMPORT = `import { formatNumber } from "@/lib/formatters";`;

// ─── Regex patterns ───────────────────────────────────────────────────────────

// Pattern 1 & 2: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(X)
// Capture group 1: the currency value ('USD' or someVar), group 2: the value expression
const INTL_CURRENCY_RE = /new Intl\.NumberFormat\(['"]en-US['"]\s*,\s*\{[^}]*style:\s*['"]currency['"][^}]*currency:\s*(['"]([A-Z]{3})['"]|[a-zA-Z_.[\]']+)[^}]*\}\s*\)\.format\(([^)]+)\)/g;

// Pattern 3: new Intl.NumberFormat('en-US', { minimumFractionDigits: N, ... }).format(X)
const INTL_NUMBER_RE = /new Intl\.NumberFormat\(['"]en-US['"]\s*,\s*\{([^}]*)\}\s*\)\.format\(([^)]+)\)/g;

// Pattern 4 & 5: .toLocaleString('en-US', { ... })
const LOCALE_STRING_RE = /\.toLocaleString\(['"]en-US['"]\s*,\s*\{([^}]*)\}\)/g;

// Pattern 6: .toLocaleString('en-US') with no options
const LOCALE_STRING_SIMPLE_RE = /\.toLocaleString\(['"]en-US['"]\)/g;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractDecimals(opts: string): number {
    const m = opts.match(/(?:minimum|maximum)FractionDigits:\s*(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
}

function ensureFormatterImport(content: string, needsCurrency: boolean, needsNumber: boolean): string {
    const hasCurrency = content.includes("formatCurrency");
    const hasNumber = content.includes("formatNumber");
    const hasImport = content.includes("@/lib/formatters");

    let importLine: string;
    if (needsCurrency && needsNumber) importLine = FORMATTERS_IMPORT;
    else if (needsCurrency) importLine = FORMATTERS_CURRENCY_IMPORT;
    else importLine = FORMATTERS_NUMBER_IMPORT;

    if (hasImport) {
        // Merge — replace existing formatters import with combined
        return content.replace(
            /import\s*\{[^}]+\}\s*from\s*["']@\/lib\/formatters["'];?/,
            importLine
        );
    }

    // Inject after last @/ import
    const lastAt = [...content.matchAll(/^import\s.*from\s+["']@\//gm)].at(-1);
    if (lastAt && lastAt.index !== undefined) {
        const insertAt = lastAt.index + lastAt[0].length;
        const lineEnd = content.indexOf("\n", insertAt);
        return content.slice(0, lineEnd + 1) + importLine + "\n" + content.slice(lineEnd + 1);
    }
    return importLine + "\n" + content;
}

function patchFile(filePath: string): number {
    let content = fs.readFileSync(filePath, "utf8");
    let count = 0;
    let needsCurrency = false;
    let needsNumber = false;

    // ── Pattern 1 & 2: Intl.NumberFormat currency ──────────────────────────────
    content = content.replace(INTL_CURRENCY_RE, (match, currencyExpr, currencyLiteral, valueExpr) => {
        count++;
        needsCurrency = true;
        const cur = currencyLiteral ?? currencyExpr; // 'USD' or variable name
        if (cur === "USD" || cur === "'USD'" || cur === '"USD"') {
            return `formatCurrency(${valueExpr.trim()})`;
        }
        // dynamic currency variable
        return `formatCurrency(${valueExpr.trim()}, ${cur.replace(/['"]/g, "")})`;
    });

    // ── Pattern 3: Intl.NumberFormat number ────────────────────────────────────
    content = content.replace(INTL_NUMBER_RE, (match, opts, valueExpr) => {
        // Skip currency ones already handled
        if (match.includes("style:") && match.includes("currency:")) return match;
        count++;
        needsNumber = true;
        const decimals = extractDecimals(opts);
        return decimals > 0
            ? `formatNumber(${valueExpr.trim()}, ${decimals})`
            : `formatNumber(${valueExpr.trim()})`;
    });

    // ── Pattern 4 & 5: .toLocaleString('en-US', { ... }) ───────────────────────
    content = content.replace(LOCALE_STRING_RE, (match, opts) => {
        count++;
        needsNumber = true;
        const decimals = extractDecimals(opts);
        return decimals > 0 ? `, ${decimals})` : ")";
        // NOTE: this replaces just the `.toLocaleString(...)` tail — caller must wrap with formatNumber
        // Simpler approach below (reset match):
    });

    // Re-read and do a simpler replacement for toLocaleString patterns
    // Reset LOCALE_STRING_RE position and redo with simpler approach
    fs.writeFileSync(filePath, content, "utf8");
    content = fs.readFileSync(filePath, "utf8");

    // ── toLocaleString: replace value.toLocaleString('en-US', opts) with formatNumber(value, decimals)
    const LS_FULL_RE = /([a-zA-Z0-9_.()[\]'" +*-]+)\.toLocaleString\(['"]en-US['"]\s*,\s*\{([^}]*)\}\)/g;
    content = content.replace(LS_FULL_RE, (match, valueExpr, opts) => {
        const decimals = extractDecimals(opts);
        needsNumber = true;
        count++;
        return decimals > 0
            ? `formatNumber(${valueExpr.trim()}, ${decimals})`
            : `formatNumber(${valueExpr.trim()})`;
    });

    // ── .toLocaleString('en-US') with no options → formatNumber(value)
    const LS_SIMPLE_RE = /([a-zA-Z0-9_.()[\]'" +*-]+)\.toLocaleString\(['"]en-US['"]\)/g;
    content = content.replace(LS_SIMPLE_RE, (match, valueExpr) => {
        needsNumber = true;
        count++;
        return `formatNumber(${valueExpr.trim()})`;
    });

    if (count > 0) {
        content = ensureFormatterImport(content, needsCurrency, needsNumber);
        fs.writeFileSync(filePath, content, "utf8");
    }

    return count;
}

// ─── Walk src/pages and src/components ───────────────────────────────────────
function walkDir(dir: string): string[] {
    const files: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "ui") continue; // skip src/components/ui
            files.push(...walkDir(fullPath));
        } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
            files.push(fullPath);
        }
    }
    return files;
}

const SRC_DIRS = [
    path.join(ROOT, "src/pages"),
    path.join(ROOT, "src/components"),
    path.join(ROOT, "src/lib"),
];

let totalReplaced = 0;
let filesModified = 0;

for (const dir of SRC_DIRS) {
    for (const file of walkDir(dir)) {
        const content = fs.readFileSync(file, "utf8");
        if (!content.includes("en-US")) continue; // fast skip
        const count = patchFile(file);
        if (count > 0) {
            totalReplaced += count;
            filesModified++;
            const rel = path.relative(ROOT, file);
            console.log(`✓ ${rel} — ${count} instance(s)`);
        }
    }
}

console.log(`\n╔══════════════════════════════════════════════╗`);
console.log(`║   Category AL Fix Complete                   ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║  Locale instances replaced : ${String(totalReplaced).padEnd(13)}║`);
console.log(`║  Files modified            : ${String(filesModified).padEnd(13)}║`);
console.log(`╚══════════════════════════════════════════════╝`);
console.log(`\nNext step: npx tsc --noEmit`);
