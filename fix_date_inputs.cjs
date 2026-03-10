const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

function fixDateInputs(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Check if the file contains <input type="date"
    // Also handle cases with other attributes before type="date"
    // e.g., <input className="ti" type="date"

    // Regex to match <input ... type="date" ... > or />
    const inputRegex = /<input([^>]*?)type=["']date["']([^>]*?)(\/?)>/g;

    let hasChanges = false;
    let newContent = content.replace(inputRegex, (match, before, after, selfClose) => {
        hasChanges = true;
        return `<Input${before}type="date"${after}${selfClose}>`;
    });

    // Replace closing tags if any exist (though rare for inputs)
    const closingRegex = /<\/input>/g;
    if (hasChanges && closingRegex.test(newContent)) {
        newContent = newContent.replace(closingRegex, '</Input>');
    }

    if (hasChanges) {
        // Check if Input is imported
        const inputImportRegex = /import\s+\{.*Input.*\}\s+from\s+['"]@\/components\/ui\/input['"]/;
        if (!inputImportRegex.test(newContent)) {
            // Find the last import statement
            const imports = newContent.match(/^import.*$/gm) || [];
            if (imports.length > 0) {
                const lastImport = imports[imports.length - 1];
                const newImport = `import { Input } from "@/components/ui/input";\n`;
                newContent = newContent.replace(lastImport, `${lastImport}\n${newImport}`);
            } else {
                // Prepend if no imports exist
                const newImport = `import { Input } from "@/components/ui/input";\n`;
                newContent = newImport + newContent;
            }
        }

        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Fixed: ${filePath}`);
    }
}

function traverseDirectory(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            fixDateInputs(fullPath);
        }
    });
}

console.log("Starting date input refactor script...");
traverseDirectory(directoryPath);
console.log("Done!");
