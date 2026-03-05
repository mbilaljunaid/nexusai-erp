const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const nativeTagsWithTitle = [];
const componentTagsWithTitle = [];

function analyzeTitles(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find all tags with title="..." or title={...}
    // Simple regex for tags containing title=
    const tagRegex = /<([a-zA-Z0-9]+)[^>]*?\stitle=(?:["'][^"']*["']|\{[^}]*\})[^>]*?>/g;

    let match;
    while ((match = tagRegex.exec(content)) !== null) {
        const tagName = match[1];
        if (tagName === tagName.toLowerCase()) {
            // It's a native HTML tag (div, span, button, a, svg, etc.)
            nativeTagsWithTitle.push({ file: filePath, tag: match[0], tagName });
        } else {
            // It's a React component
            componentTagsWithTitle.push({ file: filePath, tag: match[0], tagName });
        }
    }
}

function traverseDirectory(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            analyzeTitles(fullPath);
        }
    });
}

traverseDirectory(directoryPath);

console.log(`Native HTML Elements with title=: ${nativeTagsWithTitle.length}`);
const nativeCounts = {};
nativeTagsWithTitle.forEach(item => {
    nativeCounts[item.tagName] = (nativeCounts[item.tagName] || 0) + 1;
});
console.log("Native Tag Breakdown:", JSON.stringify(nativeCounts, null, 2));

console.log(`React Components with title=: ${componentTagsWithTitle.length}`);
const compCounts = {};
componentTagsWithTitle.forEach(item => {
    compCounts[item.tagName] = (compCounts[item.tagName] || 0) + 1;
});
// Only show top 10 components
const sortedComps = Object.entries(compCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
console.log("Top 10 React Components with title=:", JSON.stringify(Object.fromEntries(sortedComps), null, 2));

// Log the actual native tags for inspection
console.log("\nSample Native Tags:");
nativeTagsWithTitle.slice(0, 10).forEach(item => {
    console.log(`${item.tagName} in ${path.basename(item.file)}: ${item.tag.slice(0, 100)}...`);
});
