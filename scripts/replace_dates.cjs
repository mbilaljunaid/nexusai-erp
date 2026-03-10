const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, '../src');

// Find all TSX/TS files
const files = glob.sync('**/*.{ts,tsx}', { cwd: SRC_DIR, absolute: true, ignore: ['**/node_modules/**', '**/*.d.ts', 'lib/dateUtils.ts'] });

let modifiedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Track if we need imports
    let needsFormatDate = false;
    let needsFormatDateTime = false;
    let needsFormatTime = false;

    // 1. Replace new Date(X).toLocaleDateString(...)
    // X can be empty
    content = content.replace(/new Date\((.*?)\)\.toLocaleDateString\((.*?)\)/g, (match, p1, p2) => {
        needsFormatDate = true;
        return p1.trim() ? `formatDate(${p1})` : `formatDate(new Date())`;
    });

    // 2. Replace new Date(X).toLocaleTimeString(...)
    content = content.replace(/new Date\((.*?)\)\.toLocaleTimeString\((.*?)\)/g, (match, p1, p2) => {
        needsFormatTime = true;
        return p1.trim() ? `formatTime(${p1})` : `formatTime(new Date())`;
    });

    // 3. Replace new Date(X).toLocaleString(...)
    content = content.replace(/new Date\((.*?)\)\.toLocaleString\((.*?)\)/g, (match, p1, p2) => {
        needsFormatDateTime = true;
        return p1.trim() ? `formatDateTime(${p1})` : `formatDateTime(new Date())`;
    });

    // 4. Also handle cases where a variable is already a date: dateVar.toLocaleDateString()
    // This is riskier but let's try a simple heuristic for common variable names like 'date', 'd', 'item.date', etc.
    // We'll skip this automated step for anything not 'new Date(...)' to be safe and avoid breaking strings etc.

    if (content !== originalContent) {
        // Add imports
        const importsToAdd = [];
        if (needsFormatDate && !content.includes('formatDate(') && !content.includes('import { formatDate')) {
            importsToAdd.push('formatDate');
        } else if (needsFormatDate && content.includes('formatDate(') && !content.includes('import {') && !content.includes('formatDate')) {
            // simple check
        }

        // Let's just blindly add the import if it's missing but needed
        const imports = [];
        if (needsFormatDate && !content.includes('formatDate } from')) imports.push('formatDate');
        if (needsFormatDateTime && !content.includes('formatDateTime } from')) imports.push('formatDateTime');
        if (needsFormatTime && !content.includes('formatTime } from')) imports.push('formatTime');

        if (imports.length > 0) {
            const importStatement = `import { ${imports.join(', ')} } from "@/lib/dateUtils";\n`;

            // Find the last import statement or put at top
            const lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                const endOfLastImport = content.indexOf('\n', lastImportIndex);
                if (endOfLastImport !== -1) {
                    content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
                } else {
                    content = importStatement + content;
                }
            } else {
                content = importStatement + content;
            }
        }

        // Quick fix for the import logic:
        // Actually, let's just use string replacement on the first import
        if (!originalContent.includes('@/lib/dateUtils')) {
            let importToAdd = `import { `;
            let funcs = [];
            if (content.includes('formatDate(')) funcs.push('formatDate');
            if (content.includes('formatDateTime(')) funcs.push('formatDateTime');
            if (content.includes('formatTime(')) funcs.push('formatTime');

            if (funcs.length > 0) {
                importToAdd += funcs.join(', ') + ` } from "@/lib/dateUtils";\n`;
                content = importToAdd + content;
            }
        }

        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log(`Updated ${path.relative(SRC_DIR, file)}`);
    }
}

console.log(`\nModified ${modifiedCount} files.`);
