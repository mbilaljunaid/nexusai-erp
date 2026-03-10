import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very careful, non-greedy match for className={`...`} that does NOT have cn( or other wrappers immediately preceding 
// the backtick. Wait, the backtick is inside the braces: className={`...`}
// We want to match: className={`...`}
// But if it's already className={cn(`...`)} it will not match the regex below if we check the curly brace.
// Regex: className=\{`([\s\S]*?)`\}
const REGEX = /className=\{`([\s\S]*?)`\}/g;

function walkSync(dir: string, filelist: string[] = []) {
    if (!fs.existsSync(dir)) return filelist;
    const files = fs.readdirSync(dir);
    files.forEach(function (file) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            if (filepath.includes('src/components/ui')) return; // Ignore standard UI components
            if (filepath.includes('node_modules')) return;
            filelist = walkSync(filepath, filelist);
        } else {
            if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
                filelist.push(filepath);
            }
        }
    });
    return filelist;
}

const targetDirs = [
    path.join(__dirname, '../src/pages'),
    path.join(__dirname, '../src/components'),
];

let totalReplacements = 0;
let filesModified = 0;

targetDirs.forEach(dir => {
    const files = walkSync(dir);
    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let modifications = 0;

        content = content.replace(REGEX, (match, innerTemplate) => {
            modifications++;
            return `className={cn(\`${innerTemplate}\`)}`;
        });

        if (modifications > 0) {
            // Check for cn import
            if (!content.includes('import { cn }') && !content.includes('import {cn}')) {
                // Determine import path relative depth or just use alias
                content = `import { cn } from "@/lib/utils";\n` + content;
            }
            fs.writeFileSync(file, content, 'utf8');
            totalReplacements += modifications;
            filesModified++;
            console.log(`Updated ${file}: ${modifications} standardizations`);
        }
    });
});

console.log(`\nCompleted Category AC Refactoring (Template Literal ClassNames):`);
console.log(`Total Files Modified: ${filesModified}`);
console.log(`Total Wrappers Applied: ${totalReplacements}`);
