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

            // Fix left over number/bracket from </h1> e.g. "Access 1>"
            content = content.replace(/title="([^"]*?)\s*\d+>\s*<p[^>]*>(.*?)<\/p>\s*<\/div>/g, 'title="$1"\n      description="$2"\n    >');
            content = content.replace(/title="([^"]*?)\s*\d+>\s*<\/div>/g, 'title="$1"\n    >');
            content = content.replace(/title="([^"]*?)\s*\d+>\s*/g, 'title="$1"');

            // Replace mismatched trailing </div> if <StandardPage> is not closed
            if (content.includes('<StandardPage') && !content.includes('</StandardPage>')) {
                // Find the last </div> before );
                content = content.replace(/<\/div>(\s*\);\s*\n?(?:}\s*)?(?:export\s+default\s+\w+;\s*)?)$/, '</StandardPage>$1');
            }

            // Remove extra </div> right before </StandardPage>
            content = content.replace(/<\/div>\s*<\/StandardPage\s*>/g, '</StandardPage>');

            // Remove multiple extra </div> before </StandardPage>
            content = content.replace(/<\/div>\s*<\/div>\s*<\/StandardPage\s*>/g, '</StandardPage>');

            // Wait, also check for <StandardPage> followed immediately by an untagged </div>
            // Wait, if there are multiple occurrences of </div></StandardPage>, it will replace all. This is fine.

            // Fix the extra `("` or `)` issues if left over?
            // "Expression expected" can also be caused by `<div ...> \n );`

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                fixCount++;
                console.log(`Fixed ${file}`);
            }
        }
    }
}

processDir(dir);
console.log(`Total files fixed: ${fixCount}`);
