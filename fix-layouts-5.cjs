const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src/pages');
let fixCount = 0;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Pattern: Missing quote on description, followed by </h1>
            content = content.replace(/(description="[^"]*?)<\/h1>\s*<p[^>]*>.*?<\/p>\s*<\/div\s*>/gs, '$1"\n    >');
            content = content.replace(/(description="[^"]*?)<\/h1>\s*<\/div\s*>/gs, '$1"\n    >');

            // Fix unclosed `title` missing a quote and ending in `</h1>`
            content = content.replace(/(title="[^"]*?)<\/h1>\s*<p[^>]*>.*?<\/p>\s*<\/div\s*>/gs, '$1"\n    >');
            content = content.replace(/(title="[^"]*?)<\/h1>\s*<\/div\s*>/gs, '$1"\n    >');

            // What if it is `description="..."\n   <div` with missing `>`?
            content = content.replace(/(<StandardPage[^>]*?description="[^"]*")\s*<div /g, '$1>\n      <div ');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                fixCount++;
                console.log(`Fixed missing quotes/braces in ${file}`);
            }
        }
    }
}

processDir(dir);
console.log(`Total files fixed: ${fixCount}`);
