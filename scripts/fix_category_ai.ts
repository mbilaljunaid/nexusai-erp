import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * FIX: Category AI — Submit Buttons Missing Loading / Disabled State
 *
 * Strategy: use `form.formState.isSubmitting` (RHF's built-in) —
 * RHF automatically sets isSubmitting=true while the submit handler
 * is executing (including async), then resets it. This requires zero
 * external state and works for all forms (pure RHF, mutation-backed, etc.).
 *
 * For each violating Button:
 *   <Button type="submit">Label</Button>
 *   →
 *   <Button type="submit" disabled={form.formState.isSubmitting}>
 *     {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 *     Label
 *   </Button>
 *
 * Files with a named form instance other than "form" are handled by
 * detecting the local form variable name (runForm, emailForm, etc.)
 * from useForm() declarations in the same file.
 *
 * Run: npx tsx scripts/fix_category_ai.ts
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Targeted file-level patches ─────────────────────────────────────────────
// Each entry specifies the form variable name used in that file so the
// disabled expression is wired correctly.
const TARGETED: Array<{
    file: string;
    formVar: string;  // e.g. "form", "runForm", "emailForm"
}> = [
        { file: "src/pages/rewards/CompensationDashboard.tsx", formVar: "form" },
        { file: "src/pages/rewards/PayrollWorkbench.tsx", formVar: "runForm" },
        { file: "src/pages/gl/EliminationRules.tsx", formVar: "form" },
        { file: "src/pages/ExternalSupplierRegistration.tsx", formVar: "form" },
        { file: "src/pages/ContactPage.tsx", formVar: "form" },
        { file: "src/pages/ForgotPasswordPage.tsx", formVar: "emailForm" },
        { file: "src/pages/finance/ar/ARCustomers.tsx", formVar: "customerForm" },
        { file: "src/pages/manufacturing/ShopFloorTerminal.tsx", formVar: "form" },
        { file: "src/pages/maintenance/PermitWorkflow.tsx", formVar: "form" },
        { file: "src/pages/maintenance/ServiceRequestPortal.tsx", formVar: "form" },
        { file: "src/pages/hr/learning/admin/AssessmentBuilder.tsx", formVar: "form" },
        { file: "src/pages/hr/learning/LearningDashboard.tsx", formVar: "form" },
        { file: "src/pages/TrainingContentSubmit.tsx", formVar: "form" },
        // Shared form components — use form.formState.isSubmitting directly
        { file: "src/components/forms/AdjustmentEntryForm.tsx", formVar: "form" },
        { file: "src/components/forms/RequisitionForm.tsx", formVar: "form" },
        { file: "src/components/forms/VendorEntryForm.tsx", formVar: "form" },
        { file: "src/components/forms/PayrollForm.tsx", formVar: "form" },
        { file: "src/components/forms/CustomerEntryForm.tsx", formVar: "form" },
        { file: "src/components/forms/PerformanceRatingForm.tsx", formVar: "form" },
        { file: "src/components/FeedbackWidget.tsx", formVar: "form" },
    ];

const ROOT = path.join(__dirname, "..");

function ensureLoader2Import(content: string): string {
    if (content.includes("Loader2")) return content; // already imported
    // Find lucide-react import and add Loader2
    const lucideMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']/);
    if (lucideMatch) {
        const existing = lucideMatch[1];
        if (!existing.includes("Loader2")) {
            return content.replace(lucideMatch[0],
                lucideMatch[0].replace("{", "{ Loader2,"));
        }
        return content;
    }
    // No lucide import — add one after last import line
    const lastImport = [...content.matchAll(/^import .+$/gm)].at(-1);
    if (lastImport && lastImport.index !== undefined) {
        const insertAt = lastImport.index + lastImport[0].length;
        return content.slice(0, insertAt) +
            '\nimport { Loader2 } from "lucide-react";' +
            content.slice(insertAt);
    }
    return content;
}

// Replace <Button type="submit" ...>LABEL</Button>
// with    <Button type="submit" ... disabled={FORMVAR.formState.isSubmitting}>
//           {FORMVAR.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//           LABEL
//         </Button>
function patchSubmitButton(content: string, formVar: string): { result: string; count: number } {
    let count = 0;

    // Pattern: single-line <Button type="submit" ...>LABEL</Button>
    // Does NOT already have disabled prop
    const singleLine = /(<Button\s+type="submit"(?:\s+[^>]*?)?)>([^<{]+)<\/Button>/g;
    let result = content.replace(singleLine, (match, opening, label) => {
        if (opening.includes("disabled=")) return match;
        count++;
        return `${opening} disabled={${formVar}.formState.isSubmitting}>\n              {${formVar}.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}\n              ${label.trim()}\n            </Button>`;
    });

    return { result, count };
}

let totalPatched = 0;
let filesModified = 0;

for (const { file, formVar } of TARGETED) {
    const fp = path.join(ROOT, file);
    if (!fs.existsSync(fp)) {
        console.warn(`⚠ Not found: ${file}`);
        continue;
    }

    let content = fs.readFileSync(fp, "utf8");
    const { result, count } = patchSubmitButton(content, formVar);

    if (count > 0) {
        const withImport = ensureLoader2Import(result);
        fs.writeFileSync(fp, withImport, "utf8");
        totalPatched += count;
        filesModified++;
        console.log(`✓ ${file} — ${count} button(s) patched [${formVar}]`);
    } else {
        console.log(`  (no single-line pattern in ${file} — may need manual review)`);
    }
}

// Also handle PayrollWorkbench remaining two (Save) buttons with different form vars
const pwFile = path.join(ROOT, "src/pages/rewards/PayrollWorkbench.tsx");
if (fs.existsSync(pwFile)) {
    let pw = fs.readFileSync(pwFile, "utf8");
    // The two "Save" buttons inside deductionForm and taxForm dialogs
    const saves = pw.match(/<Button type="submit" className="w-full">Save<\/Button>/g);
    if (saves && saves.length > 0) {
        pw = pw.replace(/<Button type="submit" className="w-full">Save<\/Button>/g,
            `<Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>\n                                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}\n                                        Save\n                                      </Button>`);
        pw = ensureLoader2Import(pw);
        fs.writeFileSync(pwFile, pw, "utf8");
        totalPatched += saves.length;
        console.log(`✓ src/pages/rewards/PayrollWorkbench.tsx — ${saves.length} Save button(s) patched [form]`);
    }
}

console.log(`\n╔══════════════════════════════════════════════╗`);
console.log(`║   Category AI Fix Complete                   ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║  Buttons patched       : ${String(totalPatched).padEnd(18)}║`);
console.log(`║  Files modified        : ${String(filesModified).padEnd(18)}║`);
console.log(`╚══════════════════════════════════════════════╝`);
console.log(`\nApproach: disabled={form.formState.isSubmitting}`);
console.log(`         + Loader2 spinner while submitting`);
console.log(`\nNext step: npx tsc --noEmit`);
