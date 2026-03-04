import { Project, SyntaxKind, JsxElement, Node, FunctionDeclaration, VariableDeclaration } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/pages/**/*.tsx");

let processedCount = 0;

for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    if (filePath.includes("node_modules")) continue;
    if (filePath.includes("LoginPage") || filePath.includes("SignupPage") || filePath.includes("ForgotPasswordPage")) continue;

    const text = sourceFile.getFullText();
    if (["StandardPage", "StandardDashboard", "ModulePageTemplate", "IndustryPageTemplate", "AdminLayout", "DashboardLayout", "SidebarLayout", "CustomerPortalLayout"].some(w => text.includes(w))) {
        continue;
    }

    // Find the primary component in the file (default export, or named export with uppercase letter)
    let componentDecl: FunctionDeclaration | VariableDeclaration | undefined;

    const defaultExport = sourceFile.getDefaultExportSymbol();
    if (defaultExport) {
        const decl = defaultExport.getDeclarations()[0];
        if (Node.isFunctionDeclaration(decl) || Node.isVariableDeclaration(decl)) {
            componentDecl = decl;
        }
    } else {
        // Find named exports
        const exportedDecls = Array.from(sourceFile.getExportedDeclarations().values()).flat();
        for (const decl of exportedDecls) {
            if (Node.isFunctionDeclaration(decl) || Node.isVariableDeclaration(decl)) {
                const name = Node.isFunctionDeclaration(decl) ? decl.getName() : decl.getName();
                if (name && /^[A-Z]/.test(name)) {
                    componentDecl = decl;
                    break;
                }
            }
        }
    }

    if (!componentDecl) continue;

    let returnStmt = componentDecl.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
    if (!returnStmt) continue;

    let returnedExpression = returnStmt.getExpression();
    if (!returnedExpression) continue;

    if (Node.isParenthesizedExpression(returnedExpression)) {
        returnedExpression = returnedExpression.getExpression();
    }

    if (!Node.isJsxElement(returnedExpression)) continue;

    const jsxElement = returnedExpression as JsxElement;
    const openingElement = jsxElement.getOpeningElement();
    const tagName = openingElement.getTagNameNode().getText();

    if (tagName !== "div" && tagName !== "main") continue;

    let title = "Page Title";
    const h1Elements = jsxElement.getDescendantsOfKind(SyntaxKind.JsxElement).filter(e => e.getOpeningElement().getTagNameNode().getText() === "h1");
    let h1Node: JsxElement | undefined;

    if (h1Elements.length > 0) {
        h1Node = h1Elements[0];
        title = h1Node.getJsxChildren().map(c => c.getText()).join(" ").replace(/<\/?[^>]+(>|$)/g, "").trim();
    }

    const openingText = `<StandardPage title="${title.replace(/"/g, "&quot;").replace(/\n/g, ' ')}">`;
    const closingText = `</StandardPage>`;

    const openStart = openingElement.getStart();
    const openEnd = openingElement.getEnd();

    const closingElement = jsxElement.getClosingElement();
    const closeStart = closingElement.getStart();
    const closeEnd = closingElement.getEnd();

    try {
        let replacements = [
            { start: closeStart, end: closeEnd, text: closingText },
            { start: openStart, end: openEnd, text: openingText },
        ];
        if (h1Node) {
            replacements.push({ start: h1Node.getStart(), end: h1Node.getEnd(), text: "" });
        }

        replacements.sort((a, b) => b.start - a.start);

        for (const rep of replacements) {
            sourceFile.replaceText([rep.start, rep.end], rep.text);
        }

        const importDecls = sourceFile.getImportDeclarations();
        if (!importDecls.some(i => i.getModuleSpecifierValue() === "@/components/layout/StandardPage")) {
            sourceFile.addImportDeclaration({
                namedImports: ["StandardPage"],
                moduleSpecifier: "@/components/layout/StandardPage"
            });
        }

        sourceFile.saveSync();
        processedCount++;
        console.log(`Refactored ${filePath}`);
    } catch (e) {
        console.error(`Failed to modify ${filePath}`, e);
    }
}

console.log(`Successfully processed ${processedCount} files.`);
