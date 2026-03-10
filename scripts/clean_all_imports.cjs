const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, '../src');

// Find all TSX/TS files
const files = glob.sync('**/*.{ts,tsx}', { cwd: SRC_DIR, absolute: true, ignore: ['**/node_modules/**', '**/*.d.ts', 'lib/dateUtils.ts'] });

let cleanCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Check if the file imports dateUtils
    if (!content.includes('@/lib/dateUtils')) continue;

    const originalContent = content;

    // 1. Remove ANY line containing 'dateUtils' completely
    const lines = content.split('\n');
    let hasDateUtils = false;

    const cleanLines = lines.filter(line => {
        if (line.includes('@/lib/dateUtils')) {
            hasDateUtils = true;
            return false;
        }
        return true;
    });

    content = cleanLines.join('\n');

    // Remove any stranded "import { formatDate, " that might be stranded
    if (content.startsWith('import { formatDate, \n')) {
        content = content.replace('import { formatDate, \n', '');
    }
    if (content.startsWith('import { formatDateTime, \n')) {
        content = content.replace('import { formatDateTime, \n', '');
    }

    // 2. See what functions are actually used
    let funcs = new Set();
    // Be careful not to include them if they're just part of the import statement, but we just deleted those.
    // Also, we want to see if the file actually CALLS them.
    if (content.includes('formatDate(') || content.match(/formatDate[,; \)]/)) funcs.add('formatDate');
    if (content.includes('formatDateTime(') || content.match(/formatDateTime[,; \)]/)) funcs.add('formatDateTime');
    if (content.includes('formatTime(') || content.match(/formatTime[,; \)]/)) funcs.add('formatTime');

    // 3. Prepend exact correct import ONLY if used
    if (funcs.size > 0) {
        content = `import { ${Array.from(funcs).join(', ')} } from "@/lib/dateUtils";\n` + content;
    }

    // Also, handle the case where a file defines a local `function formatDate` OR `const formatDate =`.
    // If it has a local definition, it conflicts. We can just rename the import to `fromDateUtils` for those.
    const hasLocalFormatDate = content.includes('function formatDate') || content.includes('const formatDate =');

    if (hasLocalFormatDate && funcs.has('formatDate')) {
        // If it uses it AND has a local one, it's ambiguous. But wait, if it has a local one, it probably uses the local one!
        // So we should NOT import `formatDate` from dateUtils if there's a local one.
        funcs.delete('formatDate');
        // Let's re-build the import
        let noImportStr = '';
        if (funcs.size > 0) {
            noImportStr = `import { ${Array.from(funcs).join(', ')} } from "@/lib/dateUtils";\n`;
        }

        // Remove the one we just added
        content = content.replace(`import { formatDate`, `import {`); // crude but we'll just reconstruct:

        // Actually reconstruction:
        // Instead of the above complex logic, let's just do:
        content = cleanLines.join('\n');
        if (content.startsWith('import { formatDate, \n')) content = content.replace('import { formatDate, \n', '');
        if (content.startsWith('import { formatDateTime, \n')) content = content.replace('import { formatDateTime, \n', '');

        let finalFuncs = new Set();
        if ((content.includes('formatDate(') || content.match(/formatDate[,; \)]/)) && !hasLocalFormatDate) finalFuncs.add('formatDate');
        if (content.includes('formatDateTime(') || content.match(/formatDateTime[,; \)]/)) finalFuncs.add('formatDateTime');
        if (content.includes('formatTime(') || content.match(/formatTime[,; \)]/)) finalFuncs.add('formatTime');

        if (finalFuncs.size > 0) {
            content = `import { ${Array.from(finalFuncs).join(', ')} } from "@/lib/dateUtils";\n` + content;
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        cleanCount++;
    }
}

console.log(`Cleaned ${cleanCount} files.`);
