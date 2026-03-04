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

            // Mangled description attribute value with `</p>` and `</div>`
            content = content.replace(/(<StandardPage\s+title="[^"]+"\s+description="[^"]*")[^>]*?<\/p>(\s*<\/div\s*>)+/gs, '$1\n    >');

            // Missing `"` on description attribute, with `</h1>` and `</p>` and `</div>`
            content = content.replace(/(<StandardPage\s+title="[^"]+"\s+description="[^"]*?)<\/h1>[\s\S]*?<\/p>(\s*<\/div\s*>)+/gs, '$1"\n    >');

            // Missing `"` on description attribute, with `</h1>` and `</div>`
            content = content.replace(/(<StandardPage\s+title="[^"]+"\s+description="[^"]*?)<\/h1>[\s\S]*?<\/div\s*>/gs, '$1"\n    >');

            // Sometimes the description has no closing quote and stretches until `</p>` directly
            content = content.replace(/(<StandardPage\s+title="[^"]+"\s+description="[^"]*?)(?:<\/p>|<\/h1>)\s*(?:<\/div\s*>)+/gs, '$1"\n    >');

            // If there's STILL a missing `>` on StandardPage before the first real tag
            // We can check if `<StandardPage title="..." description="..."` does not have `>` before `<div` or `<Card`
            content = content.replace(/(<StandardPage\s+title="[^"]+"\s+description="[^"]*")\s*</gs, '$1\n    >\n      <');

            // Find an unclosed `<p ` or similar that got clipped
            content = content.replace(/(<StandardPage\s+title="[^"]+"\s+description="[^"]*")[^>]*>(.*?)<\/p>(\s*<\/div\s*>)+/gs, '$1\n    >');

            // Finally, clean up lingering unbalanced `</div>` tags at the end of the file.
            // If the file ends with </div> but `<StandardPage>` is the root wrapper,
            // make sure `<StandardPage>` is closed, then remove any extra `</div>`
            if (content.includes('<StandardPage') && !content.includes('</StandardPage>')) {
                if (content.match(/<\/div>\s*(\);\s*\n?(?:}\s*)?(?:export\s+default\s+\w+;\s*)?)$/)) {
                    content = content.replace(/<\/div>\s*(\);\s*\n?(?:}\s*)?(?:export\s+default\s+\w+;\s*)?)$/, '</StandardPage>\n$1');
                } else {
                    content = content.replace(/(\);\s*\n?(?:}\s*)?(?:export\s+default\s+\w+;\s*)?)$/, '\n</StandardPage>\n$1');
                }
            }

            // If we have `</div>` directly followed by `</StandardPage>`, and the file only has one top-level component,
            // we might have extra `</div>`s. But we don't want to blindly replace. Better leave it for TS.

            // Replace TS2657 common issues: `<StandardPage ... \n <div` -> `<StandardPage ... > \n <div`
            content = content.replace(/(<StandardPage\s+title="[^"]+"\s+description="[^\n]*)(?:\n\s*)*<(?!\/StandardPage)/g, '$1\n    >\n      <');

            // Re-run the fix for missing `"`
            content = content.replace(/(description=\"[^"]*)\s*<\/p>/g, '$1"\n    >');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                fixCount++;
                console.log(`Aggressively fixed ${file}`);
            }
        }
    }
}

processDir(dir);
console.log(`Total files fixed: ${fixCount}`);
