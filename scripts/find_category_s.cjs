const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, '../src');
const files = glob.sync('**/*.tsx', { cwd: SRC_DIR, absolute: true, ignore: ['**/node_modules/**'] });

let violations = [];

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');

    // We want to find <input ... type="checkbox" ... > or <input ... type="radio" ... >
    const regex = /<input\b([^>]*?)type=["'](checkbox|radio)["']([^>]*?)>/gi;

    let match;
    while ((match = regex.exec(content)) !== null) {
        const fullTag = match[0];

        const relPath = path.relative(path.join(__dirname, '../'), file);

        // Get line number
        const upToMatch = content.slice(0, match.index);
        const lineNum = (upToMatch.match(/\n/g) || []).length + 1;

        violations.push({
            file: relPath,
            line: lineNum,
            type: match[2].toLowerCase(),
            snippet: fullTag.replace(/\n/g, ' ').replace(/\s+/g, ' ').substring(0, 100) + '...'
        });
    }
}

console.log(`Found ${violations.length} total raw input violations in ${new Set(violations.map(v => v.file)).size} files.`);

const byFile = {};
for (const v of violations) {
    if (!byFile[v.file]) byFile[v.file] = [];
    byFile[v.file].push(v);
}

for (const [file, items] of Object.entries(byFile)) {
    console.log(`\n--- ${file} ---`);
    for (const item of items) {
        console.log(`Line ${item.line} (${item.type}): ${item.snippet}`);
    }
}
