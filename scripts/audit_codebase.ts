import * as fs from 'fs';
import * as path from 'path';

const AUDIT_FILE = 'AUDIT_RESULTS.md';
const SEARCH_DIRS = ['src', 'backend/src', 'shared'];
// Only search these directories if they exist
const ROOT_DIR = process.cwd();

const PATTERNS = [
    { name: 'TODO/FIXME', regex: /\/\/\s*(TODO|FIXME)/i },
    { name: 'Assumption', regex: /\/\/\s*(Assuming|We should|We can)/i },
    { name: 'Mock/Dummy Data', regex: /(const|let|var)\s+\w*(mock|dummy|fake)\w*\s*=/i }, // Variable definition
    { name: 'Empty Catch', regex: /\.catch\(\(\s*\) => \{\s*\}\)/ },
    { name: 'TS Ignore', regex: /@ts-(ignore|expect-error)/ },
    // Heuristic for hardcoded array of objects: const x = [ { ...
    { name: 'Hardcoded Data', regex: /=\s*\[\s*\{/ }
];

interface Issue {
    file: string;
    line: number;
    code: string;
    type: string;
}

const results: Issue[] = [];
let filesSearched = 0;

function searchFile(filePath: string) {
    filesSearched++;
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            const cleanLine = line.trim();
            if (!cleanLine) return;

            for (const pattern of PATTERNS) {
                if (pattern.regex.test(cleanLine)) {
                    // Avoid super long lines (minified code)
                    if (cleanLine.length > 200) continue;

                    results.push({
                        file: path.relative(ROOT_DIR, filePath),
                        line: index + 1,
                        code: cleanLine,
                        type: pattern.name
                    });
                }
            }
        });
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
    }
}

function walkDir(dir: string) {
    const fullDir = path.resolve(ROOT_DIR, dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir);
    for (const file of files) {
        const fullPath = path.join(fullDir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(path.join(dir, file));
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(file)) {
            searchFile(fullPath);
        }
    }
}

// Main execution
console.log('🔍 Starting Codebase Audit...');
SEARCH_DIRS.forEach(d => walkDir(d));

// Generate Report
let mdContent = `# Codebase Audit Results\n\nGenerated on: ${new Date().toISOString()}\n\n`;
mdContent += `### Summary\n`;
mdContent += `- **Files Searched**: ${filesSearched}\n`;
mdContent += `- **Total Issues Found**: ${results.length}\n\n`;

// Group by file
const issuesByFile: Record<string, Issue[]> = {};
results.forEach(i => {
    if (!issuesByFile[i.file]) issuesByFile[i.file] = [];
    issuesByFile[i.file].push(i);
});

// Top 5 files
const sortedFiles = Object.keys(issuesByFile).sort((a, b) => issuesByFile[b].length - issuesByFile[a].length);
const top5 = sortedFiles.slice(0, 5);

console.log(`\n📊 Stats:`);
console.log(`Files Searched: ${filesSearched}`);
console.log(`Total Issues: ${results.length}`);
console.log(`Top 5 Files with Issues:`);

mdContent += `### Top 5 Files with Issues\n`;
top5.forEach(f => {
    const count = issuesByFile[f].length;
    mdContent += `- **${f}**: ${count} issues\n`;
    console.log(`- ${f}: ${count}`);
});

mdContent += `\n## Detailed Findings\n`;

for (const file of sortedFiles) {
    mdContent += `### ${file}\n`;
    mdContent += `| Line | Type | Code Snippet |\n|---|---|---|\n`;
    issuesByFile[file].forEach(issue => {
        // Escape pipes for markdown table
        const code = issue.code.replace(/\|/g, '\\|').replace(/`/g, '\\`');
        mdContent += `| ${issue.line} | ${issue.type} | \`${code}\` |\n`;
    });
    mdContent += `\n`;
}

fs.writeFileSync(path.resolve(ROOT_DIR, AUDIT_FILE), mdContent);
console.log(`\n✅ Audit Results written to ${AUDIT_FILE}`);
