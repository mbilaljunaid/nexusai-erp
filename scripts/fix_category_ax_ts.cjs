const { Project, SyntaxKind } = require("ts-morph");

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");
let modifiedCount = 0;

sourceFiles.forEach(sourceFile => {
    // Fast fail check
    const text = sourceFile.getFullText();
    if (!text.includes("<a ") && !text.includes("<a\\n") && !text.includes("<a>")) return;

    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);
    const jsxSelfClosing = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    let modified = false;

    [...jsxElements, ...jsxSelfClosing].forEach(element => {
        if (element.wasForgotten()) return;

        let openingElement = element.getKind() === SyntaxKind.JsxElement ?
            element.getOpeningElement() : element;

        if (openingElement.getTagNameNode().getText() === "a") {
            const hrefAttr = openingElement.getAttribute("href");
            if (hrefAttr) {
                // Check if href starts with "/"
                let isInternal = false;
                if (hrefAttr.getKind() === SyntaxKind.JsxAttribute) {
                    const init = hrefAttr.getInitializer();
                    if (init) {
                        if (init.getKind() === SyntaxKind.StringLiteral) {
                            if (init.getLiteralText().startsWith("/")) isInternal = true;
                        } else if (init.getKind() === SyntaxKind.JsxExpression) {
                            const expr = init.getExpression();
                            if (expr && expr.getKind() === SyntaxKind.StringLiteral && expr.getLiteralText().startsWith("/")) {
                                isInternal = true;
                            }
                            if (expr && expr.getKind() === SyntaxKind.TemplateExpression) {
                                const head = expr.getHead().getText();
                                if (head.includes("/")) isInternal = true;
                            }
                            if (expr && expr.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
                                if (expr.getText().replace(/`/g, '').startsWith("/")) isInternal = true;
                            }
                        }
                    }
                }

                if (isInternal) {
                    // It's an internal link, replace 'a' with 'Link'
                    openingElement.getTagNameNode().replaceWithText("Link");

                    if (element.getKind() === SyntaxKind.JsxElement) {
                        const closingElement = element.getClosingElement();
                        closingElement.getTagNameNode().replaceWithText("Link");
                    }
                    modified = true;
                }
            }
        }
    });

    if (modified) {
        // Inject wouter Link import if missing
        let hasLinkImport = false;
        sourceFile.getImportDeclarations().forEach(imp => {
            if (imp.getModuleSpecifierValue() === "wouter") {
                const namedImports = imp.getNamedImports();
                if (namedImports.some(ni => ni.getName() === "Link")) {
                    hasLinkImport = true;
                }
            }
        });

        if (!hasLinkImport) {
            sourceFile.addImportDeclaration({
                namedImports: ["Link"],
                moduleSpecifier: "wouter"
            });
        }

        sourceFile.saveSync();
        console.log(`Replaced internal <a> with <Link> in ${sourceFile.getFilePath()}`);
        modifiedCount++;
    }
});

console.log(`Total files modernized correctly: ${modifiedCount}`);
