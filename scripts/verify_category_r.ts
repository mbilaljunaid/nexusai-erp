import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory() && !fullPath.includes('node_modules')) {
            results = results.concat(walkDir(fullPath));
        } else if (fullPath.endsWith('.tsx')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walkDir(path.resolve('./src'));
let violations: string[] = [];

files.forEach(file => {
    const sourceFile = ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
    );

    function visit(node: ts.Node) {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
            const tagName = node.tagName.getText(sourceFile);

            if (['div', 'span', 'p'].includes(tagName)) {
                let hasOnClick = false;
                let hasRoleButton = false;

                for (const prop of node.attributes.properties) {
                    if (ts.isJsxAttribute(prop)) {
                        const name = prop.name.getText(sourceFile);
                        if (name === 'onClick') {
                            hasOnClick = true;
                        }
                        if (name === 'role') {
                            if (prop.initializer && prop.initializer.getText(sourceFile).includes('button')) {
                                hasRoleButton = true;
                            }
                        }
                    }
                }

                if (hasOnClick && !hasRoleButton) {
                    const lineInfo = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                    violations.push(`${file}:${lineInfo.line + 1} -> <${tagName}> missing role="button"`);
                }
            }
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
});

console.log(`Found ${violations.length} violations`);
violations.forEach(v => console.log(v));
