const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src/pages');
let fixCount = 0;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath); // recurse
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Fix left over number/bracket from </h1> e.g. "Access 1>"
            content = content.replace(/title="([^"]*?)\s*\d+>\s*<p[^>]*>(.*?)<\/p>\s*<\/div>/g, 'title="$1"\n      description="$2"\n    >');
            content = content.replace(/title="([^"]*?)\s*\d+>\s*<\/div>/g, 'title="$1"\n    >');
            content = content.replace(/title="([^"]*?)\s*\d+>\s*/g, 'title="$1"');

            // Pattern 1: Missing `>` on StandardPage, followed by `<p ...>...</p>\n</div>\n</div>`
            content = content.replace(/(<StandardPage[^>]*?description="[^"]*")\s*<p className="[^"]*">[^<]*<\/p>\s*<\/div\s*>\s*<\/div\s*>/g, '$1\n    >');

            // Pattern 2: Missing `>` on StandardPage, followed by `<p ...>...</p>`
            content = content.replace(/(<StandardPage[^>]*?description="[^"]*")\s*<p(?:[^>]*)>.*?<\/p>\s*<\/div\s*>/gs, '$1\n    >');

            // Pattern 3: Missing `>` on StandardPage, followed by `</h1>`
            content = content.replace(/(<StandardPage[^>]*?title="[^"]*")\s*<\/h1>\s*<p[^>]*>.*?<\/p>\s*<\/div\s*>/gs, '$1\n    >');
            content = content.replace(/(<StandardPage[^>]*?description="[^"]*")\s*<\/h1>\s*<\/div\s*>/gs, '$1\n    >');

            // Pattern 4: Missing `>` on StandardPage, followed by just `</div >`
            content = content.replace(/(<StandardPage[^>]*?description="[^"]*")\s*<\/div\s*>\s*<\/div\s*>/g, '$1\n    >');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                fixCount++;
                console.log(`Fixed formatting in ${file}`);
            }
        }
    }
}

processDir(dir);
console.log(`Total files fixed: ${fixCount}`);
