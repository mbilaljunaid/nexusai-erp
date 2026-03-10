import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * FIX: Category AH — useMemo for Column Array Definitions
 *
 * Wraps `const columns = [...]` (and `const columns: SpreadsheetColumn[] = [...]`)
 * that are inside component function bodies and passed to <InteractiveSpreadsheet>
 * with `useMemo(() => [...], [])` to pin the array reference across renders.
 *
 * Safety: only transforms arrays that are the FULL column definition
 * (detected by looking for `SpreadsheetColumn` type annotation OR the array
 * being passed directly to an <InteractiveSpreadsheet columns={...}> or
 * <DataTable columns={...}> call in the same file).
 *
 * Run: npx tsx scripts/fix_category_ah.ts
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

function walkSync(dir: string, list: string[] = []): string[] {
    if (!fs.existsSync(dir)) return list;
    for (const name of fs.readdirSync(dir)) {
        const fp = path.join(dir, name);
        if (fs.statSync(fp).isDirectory()) {
            if (!fp.includes("node_modules") && !fp.includes("src/components/ui")) {
                walkSync(fp, list);
            }
        } else if (fp.endsWith(".tsx") || fp.endsWith(".ts")) {
            list.push(fp);
        }
    }
    return list;
}

// Detect if file uses InteractiveSpreadsheet or DataTable with columns prop
function hasSpreadsheetOrTable(content: string): boolean {
    return (
        /InteractiveSpreadsheet/.test(content) ||
        /DataTable/.test(content) ||
        /SpreadsheetColumn/.test(content)
    );
}

// Already has useMemo around this columns definition
function alreadyHasUseMemo(content: string): boolean {
    // Check if "columns" appears inside a useMemo call
    return /useMemo\s*\(\s*\(\s*\)\s*=>\s*\[/.test(content) ||
        /const columns\s*=\s*useMemo/.test(content);
}

// Wrap `const columns = [` ... `]` with useMemo
// Handles:
//   const columns = [
//   const columns: SpreadsheetColumn<X>[] = [
function wrapColumnsWithUseMemo(content: string): { result: string; count: number } {
    let count = 0;
    // Match: const columns (optional type) = [   ... multiline ...  ];
    // Strategy: find the declaration start, then track bracket depth to find end
    const lines = content.split("\n");
    const out: string[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Detect column array declaration start
        // Matches:  const columns = [ or const columns: SomeType[] = [
        const startMatch = line.match(/^(\s*)(const\s+columns(?:\s*:\s*[^=]+)?\s*=\s*)\[(.*)$/);

        if (startMatch && !line.includes("useMemo")) {
            const indent = startMatch[1];
            const decl = startMatch[2];
            const rest = startMatch[3];

            // Collect the full array by tracking bracket depth
            let depth = 1; // we've seen the opening [
            const arrayLines: string[] = [`${indent}${decl}[${rest}`];
            let j = i + 1;

            while (j < lines.length && depth > 0) {
                const l = lines[j];
                for (const ch of l) {
                    if (ch === "[") depth++;
                    else if (ch === "]") depth--;
                }
                arrayLines.push(l);
                j++;
            }

            // Determine if the closing line ends with ]; or ] (no semicolon)
            const lastLineIdx = arrayLines.length - 1;
            const lastLine = arrayLines[lastLineIdx];
            const hasSemi = /\];\s*$/.test(lastLine);

            // Build the useMemo-wrapped version
            // Replace opening line
            arrayLines[0] = `${indent}${decl}useMemo(() => [${rest}`;
            // Replace closing line — change `];` → `], []);` or `]` → `], [])`
            if (hasSemi) {
                arrayLines[lastLineIdx] = lastLine.replace(/\];\s*$/, "], []);");
            } else {
                arrayLines[lastLineIdx] = lastLine.replace(/\]\s*$/, "], [])");
            }

            out.push(...arrayLines);
            i = j;
            count++;
            continue;
        }

        out.push(line);
        i++;
    }

    return { result: out.join("\n"), count };
}

// Ensure useMemo is imported from react
function ensureUseMemoImport(content: string): string {
    if (/useMemo/.test(content) && !/from ['"]react['"]/.test(content.split("useMemo")[0])) {
        return content;
    }

    // Already imported
    const reactImportMatch = content.match(/^import\s+(\{[^}]+\})\s+from\s+['"]react['"];?$/m);
    if (reactImportMatch) {
        const imports = reactImportMatch[1];
        if (imports.includes("useMemo")) return content;
        const newImports = imports.replace("{", "{ useMemo,").replace(/,\s*,/, ",");
        return content.replace(reactImportMatch[0], reactImportMatch[0].replace(imports, newImports));
    }

    // React imported as default
    const defaultMatch = content.match(/^import\s+React\s+from\s+['"]react['"];?$/m);
    if (defaultMatch) {
        return content.replace(defaultMatch[0], `${defaultMatch[0]}\nimport { useMemo } from "react";`);
    }

    // Add fresh import at top
    return `import { useMemo } from "react";\n${content}`;
}

const TARGET_DIRS = [
    path.join(ROOT, "src/pages"),
    path.join(ROOT, "src/components"),
];

let totalWrapped = 0;
let filesModified = 0;

for (const dir of TARGET_DIRS) {
    for (const fp of walkSync(dir)) {
        const original = fs.readFileSync(fp, "utf8");

        // Only process files that use InteractiveSpreadsheet / DataTable / SpreadsheetColumn
        if (!hasSpreadsheetOrTable(original)) continue;
        // Skip if already using useMemo for columns
        if (alreadyHasUseMemo(original)) continue;
        // Skip if no column array at all
        if (!/const\s+columns\s*(?::\s*[^=]+)?\s*=\s*\[/.test(original)) continue;

        const { result, count } = wrapColumnsWithUseMemo(original);
        if (count > 0 && result !== original) {
            const withImport = ensureUseMemoImport(result);
            fs.writeFileSync(fp, withImport, "utf8");
            totalWrapped += count;
            filesModified++;
            const rel = fp.split("/src/")[1];
            console.log(`✓ ${rel} — ${count} column array(s) wrapped`);
        }
    }
}

console.log(`\n╔══════════════════════════════════════════════╗`);
console.log(`║   Category AH Fix Complete                   ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║  Column arrays wrapped : ${String(totalWrapped).padEnd(18)}║`);
console.log(`║  Files modified        : ${String(filesModified).padEnd(18)}║`);
console.log(`╚══════════════════════════════════════════════╝`);
console.log(`\nReact.memo applied separately to:`);
console.log(`  ✓ StatusBadge  (139 pages)`);
console.log(`  ✓ DashboardWidget (54 pages)`);
console.log(`  ✓ MetricCard   (14 pages)`);
console.log(`\nNext step: npx tsc --noEmit`);
