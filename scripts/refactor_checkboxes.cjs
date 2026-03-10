const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');

const checkboxFiles = [
    "pages/SignupPage.tsx",
    "pages/LoginPage.tsx",
    "pages/EnvironmentManagement.tsx",
    "pages/scm/WarehouseOperations.tsx",
    "pages/scm/FulfillmentWorkbench.tsx",
    "pages/maintenance/PMDefinitionBuilder.tsx",
    "pages/maintenance/MeterReadingModule.tsx",
    "pages/finance/ap/APSystemConfig.tsx",
    "pages/epm/ScenarioComparison.tsx",
    "components/wfm/DailyStatusBoard.tsx",
    "components/tax/TaxCodeModal.tsx",
    "components/tax/ExemptionModal.tsx",
    "components/maintenance/PlanningBoard.tsx"
];

let modifiedCount = 0;

for (const relPath of checkboxFiles) {
    const file = path.join(SRC_DIR, relPath);
    if (!fs.existsSync(file)) continue;

    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // We want to replace `<input ... type="checkbox" ...>`
    // The typical structure: <input type="checkbox" id="..." checked={foo} onChange={(e) => setFoo(e.target.checked)} />

    // We will do a generic replacement for `<input(.*?)type=["']checkbox["'](.*?)>`
    // We replace `<input` with `<Checkbox`
    // We replace `type="checkbox"` with ``
    // We replace `onChange={(e) =>` with `onCheckedChange={(checked) =>`
    // We replace `e.target.checked` with `checked`
    // Let's do a simple regex and manual string ops:

    // Replace <input...type="checkbox" -> <Checkbox
    // But then we need to make sure we don't break other inputs.
    // It's safer to extract the entire tag.

    const regex = /<input([^>]*?)type=["']checkbox["']([^>]*?)>/gi;

    content = content.replace(regex, (match, before, after) => {
        let inside = before + ' ' + after;

        // Remove onChange and checked mapping issues
        // We'll replace onChange={...} with onCheckedChange={...}
        // This is tricky if it's a multiline arrow function, but let's try basic substitution
        inside = inside.replace(/onChange=\{([^}]+)\}/, (m, fn) => {
            // Need to change `e.target.checked` to `c` if we make it `(c) => ...`
            if (fn.includes('e.target.checked')) {
                // If it is (e) => setFoo(e.target.checked)
                let newFn = fn.replace(/\(e\)\s*=>/g, '(checked: boolean) =>').replace(/e\.target\.checked/g, 'checked');
                // Also handle e => 
                newFn = newFn.replace(/e\s*=>/g, '(checked: boolean) =>');
                return `onCheckedChange={${newFn}}`;
            } else if (fn.includes('field.onChange(e.target.checked)')) { // react-hook-form
                let newFn = fn.replace(/\(e\)\s*=>/g, '(checked: boolean) =>').replace(/e\.target\.checked/g, 'checked');
                return `onCheckedChange={${newFn}}`;
            }
            // For simple onChange={() => ...} where `e` is not used
            let newFn = fn.replace(/\(\)\s*=>/g, '() =>');
            return `onCheckedChange={${newFn}}`;
        });

        // Rebuild tag
        return `<Checkbox${inside} />`;
    });

    // We need to add `import { Checkbox } from "@/components/ui/checkbox";` if missing
    if (content !== originalContent) {
        if (!content.includes('@/components/ui/checkbox')) {
            content = `import { Checkbox } from "@/components/ui/checkbox";\n` + content;
        }

        // clean up multiple spaces
        content = content.replace(/<Checkbox\s+/g, '<Checkbox ');

        // Clean up `<Checkbox  />` to `<Checkbox />`
        content = content.replace(/\s+\/>/g, ' />');

        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
    }
}

console.log(`Checkbox replaced in ${modifiedCount} files.`);
