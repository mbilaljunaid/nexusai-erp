import { Project, SyntaxKind } from "ts-morph";
import * as fs from "fs";

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
});

const TARGET_TAGS = ["div", "span", "p", "a", "Card", "TableRow", "img", "li"];

let fixedCount = 0;
const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");

for (const sourceFile of sourceFiles) {
    let modified = false;

    const jsxElements = [
        ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
    ];

    for (const element of jsxElements) {
        const tagName = element.getTagNameNode().getText();

        if (!TARGET_TAGS.includes(tagName)) {
            continue;
        }

        const onKeyDownAttr = element.getAttributes().find(attr => {
            if (attr.getKind() === SyntaxKind.JsxAttribute) {
                const name = attr.getNameNode().getText();
                return name === "onKeyDown";
            }
            return false;
        });

        const onClickAttr = element.getAttributes().find(attr => {
            if (attr.getKind() === SyntaxKind.JsxAttribute) {
                return attr.getNameNode().getText() === "onClick";
            }
            return false;
        });

        if (onKeyDownAttr && onClickAttr && onKeyDownAttr.getKind() === SyntaxKind.JsxAttribute) {
            const initializer = onKeyDownAttr.getInitializer();
            if (initializer && initializer.getText().includes("e.preventDefault();")) {
                // This is our injected handler. Replace it.
                onKeyDownAttr.remove();
                element.addAttribute({
                    name: "onKeyDown",
                    initializer: `{(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}`
                });
                modified = true;
                fixedCount++;
            }
        }
    }

    if (modified) {
        sourceFile.saveSync();
    }
}

console.log(`\Codemod Fix Complete! Fixed ${fixedCount} onKeyDown handlers.`);
