import { Project, SyntaxKind, JsxOpeningElement, JsxSelfClosingElement } from "ts-morph";
import * as fs from "fs";

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
});

const TARGET_TAGS = ["div", "span", "p", "a", "Card", "TableRow", "img", "li"];

let violations = 0;
const affectedFiles = new Set<string>();

const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");

for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();

    // Skip test files, stories, etc if needed.

    // Find all JSX elements
    const jsxElements = [
        ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
    ];

    for (const element of jsxElements) {
        const tagName = element.getTagNameNode().getText();

        // We only care about specific tags
        if (!TARGET_TAGS.includes(tagName)) {
            continue;
        }

        // Check if it has an onClick attribute
        const hasOnClick = element.getAttributes().some(attr => {
            if (attr.getKind() === SyntaxKind.JsxAttribute) {
                return attr.getNameNode().getText() === "onClick";
            }
            return false;
        });

        if (hasOnClick) {
            // Check for role="button" or tabIndex={0} or tabIndex="0"
            const hasRoleButton = element.getAttributes().some(attr => {
                if (attr.getKind() === SyntaxKind.JsxAttribute) {
                    const name = attr.getNameNode().getText();
                    if (name === "role") {
                        const init = attr.getInitializer();
                        return init && init.getText().replace(/['"]/g, '') === "button";
                    }
                }
                return false;
            });

            // We also accept role="tab" or role="menuitem" or role="switch" etc., but let's just check if it has ANY role for now.
            const hasAnyRole = element.getAttributes().some(attr => {
                if (attr.getKind() === SyntaxKind.JsxAttribute) {
                    return attr.getNameNode().getText() === "role";
                }
                return false;
            });

            const hasTabIndex = element.getAttributes().some(attr => {
                if (attr.getKind() === SyntaxKind.JsxAttribute) {
                    return attr.getNameNode().getText() === "tabIndex";
                }
                return false;
            });

            // Buttons and interactive components might be okay, but we are looking at native tags or generic ones
            if (tagName === "a") {
                const hasHref = element.getAttributes().some(attr => {
                    if (attr.getKind() === SyntaxKind.JsxAttribute) {
                        return attr.getNameNode().getText() === "href";
                    }
                    return false;
                });
                if (hasHref) continue; // valid anchor
            }

            if (!hasAnyRole && !hasTabIndex) {
                violations++;
                affectedFiles.add(filePath);
                // console.log(`Violation in ${filePath}:${element.getStartLineNumber()} - <${tagName} onClick={...}>`);
            }
        }
    }
}

console.log(`\nAudit Complete!`);
console.log(`Found ${violations} violations across ${affectedFiles.size} files.`);
// console.log(Array.from(affectedFiles).join("\n"));
fs.writeFileSync("category_r_violations.json", JSON.stringify(Array.from(affectedFiles), null, 2));
