import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * FIX: Category AJ — Raw <table> in Shared Components
 *
 * Replaces raw HTML table elements with the standardized Shadcn/ui Table
 * components from @/components/ui/table:
 *
 *   <table ...>   →  <Table ...>
 *   <thead ...>   →  <TableHeader ...>
 *   <tbody ...>   →  <TableBody ...>
 *   <tr ...>      →  <TableRow ...>
 *   <th ...>      →  <TableHead ...>
 *   <td ...>      →  <TableCell ...>
 *   </table>      →  </Table>
 *   </thead>      →  </TableHeader>
 *   </tbody>      →  </TableBody>
 *   </tr>         →  </TableRow>
 *   </th>         →  </TableHead>
 *   </td>         →  </TableCell>
 *
 * Run: npx tsx scripts/fix_category_aj.ts
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

// Files with raw <table> elements (scanned manually)
const TARGET_FILES = [
    "src/components/ReportSpreadsheet.tsx",
    "src/components/forms/ExpenseEntryForm.tsx",
    "src/components/forms/GLEntryForm.tsx",
    "src/components/forms/TimesheetForm.tsx",
    "src/components/forms/PurchaseOrderForm.tsx",
    "src/components/ap/ApPprDashboard.tsx",
    "src/components/ap/ApSideSheet.tsx",
    "src/components/tax/TaxCalculationPreview.tsx",
    "src/components/ar/ArSideSheet.tsx",
    "src/components/cm/CashGrid.tsx",
    "src/components/performance/GoalManagementPanel.tsx",
];

// ─── Tag replacement map ──────────────────────────────────────────────────────
// Order matters: process longer matches first to avoid partial replacements
const TAG_REPLACEMENTS: Array<[RegExp, string]> = [
    // Closing tags
    [/<\/table>/g, "</Table>"],
    [/<\/thead>/g, "</TableHeader>"],
    [/<\/tbody>/g, "</TableBody>"],
    [/<\/tr>/g, "</TableRow>"],
    [/<\/th>/g, "</TableHead>"],
    [/<\/td>/g, "</TableCell>"],
    // Opening tags — must match tag boundary (word char follows)
    // <table ...> or <table>
    [/<table(\s[^>]*)?>/g, (_, attrs) => `<Table${attrs ?? ""}>`],
    [/<thead(\s[^>]*)?>/g, (_, attrs) => `<TableHeader${attrs ?? ""}>`],
    [/<tbody(\s[^>]*)?>/g, (_, attrs) => `<TableBody${attrs ?? ""}>`],
    [/<tr(\s[^>]*)?>/g, (_, attrs) => `<TableRow${attrs ?? ""}>`],
    [/<th(\s[^>]*)?>/g, (_, attrs) => `<TableHead${attrs ?? ""}>`],
    [/<td(\s[^>]*)?>/g, (_, attrs) => `<TableCell${attrs ?? ""}>`],
];

// ─── Needed UI table imports ─────────────────────────────────────────────────
const TABLE_COMPONENTS = [
    "Table", "TableHeader", "TableBody", "TableRow", "TableHead", "TableCell",
];

function ensureTableImport(content: string): string {
    const existing = content.match(/import\s*\{([^}]+)\}\s*from\s*["']@\/components\/ui\/table["']/);
    if (existing) {
        // Merge any missing components into this import
        const current = new Set(existing[1].split(",").map(s => s.trim()).filter(Boolean));
        const needed = TABLE_COMPONENTS.filter(c => content.includes(`<${c}`) || content.includes(`</${c}>`));
        const missing = needed.filter(c => !current.has(c));
        if (missing.length === 0) return content;
        const merged = [...current, ...missing].sort().join(", ");
        return content.replace(existing[0], `import { ${merged} } from "@/components/ui/table"`);
    }

    // No table import yet — inject after last ui import
    const needed = TABLE_COMPONENTS.filter(c => content.includes(`<${c}`) || content.includes(`</${c}>`));
    if (needed.length === 0) return content;

    const lastUiImport = [...content.matchAll(/^import\s*\{[^}]+\}\s*from\s*["']@\/components\/ui\/[^"']+["'];?$/gm)].at(-1);
    const importLine = `import { ${needed.join(", ")} } from "@/components/ui/table";`;

    if (lastUiImport && lastUiImport.index !== undefined) {
        const insertAt = lastUiImport.index + lastUiImport[0].length;
        return content.slice(0, insertAt) + "\n" + importLine + content.slice(insertAt);
    }

    // Fallback: prepend after first import
    return content.replace(/^(import .+)$/m, `$1\n${importLine}`);
}

function applyTableReplacements(content: string): { result: string; count: number } {
    let count = 0;
    let result = content;
    for (const [pattern, replacement] of TAG_REPLACEMENTS) {
        const prev = result;
        if (typeof replacement === "string") {
            result = result.replace(pattern, replacement);
        } else {
            result = result.replace(pattern, replacement as (substring: string, ...args: unknown[]) => string);
        }
        if (result !== prev) {
            count += (prev.match(pattern) ?? []).length;
        }
    }
    return { result, count };
}

let totalTags = 0;
let filesModified = 0;

for (const relPath of TARGET_FILES) {
    const fp = path.join(ROOT, relPath);
    if (!fs.existsSync(fp)) {
        console.warn(`⚠ Not found: ${relPath}`);
        continue;
    }

    const original = fs.readFileSync(fp, "utf8");
    const { result, count } = applyTableReplacements(original);

    if (count > 0) {
        const withImport = ensureTableImport(result);
        fs.writeFileSync(fp, withImport, "utf8");
        totalTags += count;
        filesModified++;
        console.log(`✓ ${relPath} — ${count} tag(s) replaced`);
    }
}

console.log(`\n╔══════════════════════════════════════════════╗`);
console.log(`║   Category AJ Fix Complete                   ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║  HTML table tags replaced: ${String(totalTags).padEnd(14)}║`);
console.log(`║  Files modified          : ${String(filesModified).padEnd(14)}║`);
console.log(`╚══════════════════════════════════════════════╝`);
console.log(`\nNext step: npx tsc --noEmit`);
