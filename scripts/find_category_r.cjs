const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, '../src');

// Find all TSX files
const files = glob.sync('**/*.tsx', { cwd: SRC_DIR, absolute: true, ignore: ['**/node_modules/**'] });

let violations = [];

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');

    // We want to find <div ..., <span ..., <p ..., <li ..., <a ... with onClick but without role="button" or similar.
    // Given formatting can be multi-line, it's easiest to parse line by line or use a broader regex.
    // A simple approach is finding "onClick=" and checking the tag.

    // Let's use a regex that matches an opening tag with onClick
    // <(div|span|p|li)[^>]*onClick=[^>]*>

    const regex = /<(div|span|p|li)\s+([^>]*?)onClick=\{([^>]*?)>/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const fullTag = match[0];

        // Exclude if it has role="button" or tabIndex or role="tab" or role="menuitem"
        if (!fullTag.includes('role=') && !fullTag.includes('tabIndex=')) {
            const relPath = path.relative(path.join(__dirname, '../'), file);

            // Get line number
            const upToMatch = content.slice(0, match.index);
            const lineNum = (upToMatch.match(/\n/g) || []).length + 1;

            violations.push({
                file: relPath,
                line: lineNum,
                tag: match[1],
                snippet: fullTag.replace(/\n/g, ' ').substring(0, 100) + '...'
            });
        }
    }
}

console.log(`Found ${violations.length} total violations in ${new Set(violations.map(v => v.file)).size} files.`);

// Group by file
const byFile = {};
for (const v of violations) {
    if (!byFile[v.file]) byFile[v.file] = [];
    byFile[v.file].push(v);
}

for (const [file, items] of Object.entries(byFile)) {
    console.log(`\n--- ${file} ---`);
    for (const item of items) {
        console.log(`Line ${item.line}: ${item.snippet}`);
    }
}
