import { Project, SyntaxKind, JsxOpeningElement, JsxSelfClosingElement } from "ts-morph";
import * as fs from "fs";

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
});

const TARGET_TAGS = ["div", "span", "p", "a", "Card", "TableRow", "img", "li"];

let fixedCount = 0;
const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");

for (const sourceFile of sourceFiles) {
    let modified = false;

    // Find all JSX elements
    const jsxElements = [
        ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
    ];

    for (const element of jsxElements) {
        const tagName = element.getTagNameNode().getText();

        if (!TARGET_TAGS.includes(tagName)) {
            continue;
        }

        const onClickAttr = element.getAttributes().find(attr => {
            if (attr.getKind() === SyntaxKind.JsxAttribute) {
                return attr.getNameNode().getText() === "onClick";
            }
            return false;
        });

        if (onClickAttr) {
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

            if (tagName === "a") {
                const hasHref = element.getAttributes().some(attr => {
                    if (attr.getKind() === SyntaxKind.JsxAttribute) {
                        return attr.getNameNode().getText() === "href";
                    }
                    return false;
                });
                if (hasHref) continue;
            }

            if (!hasAnyRole && !hasTabIndex) {
                if (!hasAnyRole) {
                    element.addAttribute({ name: "role", initializer: '"button"' });
                }
                if (!hasTabIndex) {
                    element.addAttribute({ name: "tabIndex", initializer: "{0}" });
                }

                // Add onKeyDown mapping to onClick
                const hasOnKeyDown = element.getAttributes().some(attr => {
                    if (attr.getKind() === SyntaxKind.JsxAttribute) {
                        return attr.getNameNode().getText() === "onKeyDown";
                    }
                    return false;
                });

                if (!hasOnKeyDown && onClickAttr.getKind() === SyntaxKind.JsxAttribute) {
                    const initializer = onClickAttr.getInitializer();
                    if (initializer && initializer.getKind() === SyntaxKind.JsxExpression) {
                        const innerExpr = initializer.getExpression();
                        if (innerExpr) {
                            const innerText = innerExpr.getText();
                            element.addAttribute({
                                name: "onKeyDown",
                                initializer: `{(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (${innerText})(e as any); } }}`
                            });
                        }
                    }
                }

                modified = true;
                fixedCount++;
            }
        }
    }

    if (modified) {
        sourceFile.saveSync();
    }
}

console.log(`\Codemod Complete! Fixed ${fixedCount} violations.`);
