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

            // Form A1: title="..." </h1> <p>...</p> </div>
            content = content.replace(/title="([^"]*?)\s*<\/h1>\s*<p[^>]*>(.*?)<\/p>\s*<\/div>/g, 'title="$1"\n      description="$2"\n    >');

            // Form A2: title="..." </h1> </div>
            content = content.replace(/title="([^"]*?)\s*<\/h1>\s*<\/div>/g, 'title="$1"\n    >');

            // Form A3: just </h1>
            content = content.replace(/title="([^"]*?)\s*<\/h1>\s*/g, 'title="$1"');

            // Form A4: title="Inveny, Warehouse & Size/Color Management </h1> <p ...>...</p> </div> <div ...
            content = content.replace(/title="([^"]*?)\s*<\/h1>\s*<p[^>]*>(.*?)<\/p>\s*<\/div>/g, 'title="$1"\n      description="$2"\n    >');

            // Form B1: className="xyz"><div><h1 ...>...</h1></div><Button>...</Button></div>
            content = content.replace(
                /className="([^"]*)">\s*<div[^>]*>\s*<h1[^>]*>.*?<\/h1>\s*<\/div>\s*(<Button[\s\S]*?<\/Button>)\s*<\/div>/g,
                'className="$1"\n      actions={$2}\n    >'
            );

            // Form B2: className="xyz"><div><h1 ...>...</h1><p>...</p></div><Button>...</Button></div>
            content = content.replace(
                /className="([^"]*)">\s*<div[^>]*>\s*<h1[^>]*>.*?<\/h1>\s*<p[^>]*>.*?<\/p>\s*<\/div>\s*(<Button[\s\S]*?<\/Button>)\s*<\/div>/g,
                'className="$1"\n      actions={$2}\n    >'
            );

            // Form B3: className="xyz"><div><h1 ...>...</h1></div></div>
            content = content.replace(
                /className="([^"]*)">\s*<div[^>]*>\s*<h1[^>]*>.*?<\/h1>\s*<\/div>\s*<\/div>\s*/g,
                'className="$1"\n    >'
            );

            // Form B4: className="xyz"><div><h1 ...>...</h1><p>...</p></div></div>
            content = content.replace(
                /className="([^"]*)">\s*<div[^>]*>\s*<h1[^>]*>.*?<\/h1>\s*<p[^>]*>.*?<\/p>\s*<\/div>\s*<\/div>\s*/g,
                'className="$1"\n    >'
            );

            // Form C: <StandardPage ... ><div><h1 ...>...</h1></div>
            content = content.replace(
                /(<StandardPage[^>]*>\s*)<div[^>]*>\s*<h1[^>]*>.*?<\/h1>\s*<\/div>\s*/gs,
                '$1'
            );

            // Form C2: <StandardPage ... ><div ...><div><h1 ...>...</h1></div>
            content = content.replace(
                /(<StandardPage[^>]*>\s*)<div[^>]*>\s*<div[^>]*>\s*<h1[^>]*>.*?<\/h1>\s*<\/div>\s*(<Button[\s\S]*?<\/Button>)\s*<\/div>\s*/gs,
                '$1'
            );

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
