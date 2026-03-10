const { Project, SyntaxKind } = require("ts-morph");

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

let modded = 0;
const sourceFiles = project.getSourceFiles(["src/pages/**/*.{tsx,jsx}", "src/components/**/*.{tsx,jsx}"]);

for (const sourceFile of sourceFiles) {
    let changed = false;

    // Get nodes containing JSX Elements
    // We navigate bottom-up so wrapping doesn't shift descendants we haven't processed yet.
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement).reverse();
    const selfClosing = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).reverse();

    const processElement = (element, isSelfClosing) => {
        // Guard against processing nodes that have already been deleted/replaced
        if (element.wasForgotten()) return;

        const openingNode = isSelfClosing ? element : element.getOpeningElement();
        const roleAttr = openingNode.getAttribute("role");

        if (roleAttr && (roleAttr.getText() === 'role="button"' || roleAttr.getText() === "role={'button'}")) {
            changed = true;

            // Extract and strip non-semantic interactives
            roleAttr.remove();

            const tabIndex = openingNode.getAttribute("tabIndex");
            if (tabIndex) tabIndex.remove();

            const onKeyDown = openingNode.getAttribute("onKeyDown");
            if (onKeyDown) onKeyDown.remove();

            const onClickAttr = openingNode.getAttribute("onClick");
            let onClickText = "";
            if (onClickAttr) {
                onClickText = onClickAttr.getText();
                onClickAttr.remove();
            }

            // Re-read element text after stripping inner arbitrary properties
            const cleanInner = element.getText();

            // Wrap securely inheriting Button DOM interactions locally on native Shadcn Ghost config
            const wrapper = `<Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild ${onClickText}>\n${cleanInner}\n</Button>`;

            element.replaceWithText(wrapper);
        }
    };

    selfClosing.forEach(el => processElement(el, true));
    jsxElements.forEach(el => processElement(el, false));

    if (changed) {
        const imports = sourceFile.getImportDeclarations();
        let hasButtonImport = false;
        for (const imp of imports) {
            if (imp.getModuleSpecifierValue() === "@/components/ui/button") {
                hasButtonImport = true;
                // Check if Button is named
                const namedImports = imp.getNamedImports();
                const hasButton = namedImports.some(n => n.getName() === "Button");
                if (!hasButton) {
                    imp.addNamedImport("Button");
                }
                break;
            }
        }

        if (!hasButtonImport) {
            sourceFile.addImportDeclaration({
                namedImports: ["Button"],
                moduleSpecifier: "@/components/ui/button",
            });
        }

        // Format safely according to native IDE constraints natively preserving hooks
        sourceFile.saveSync();
        modded++;
        console.log("Modded AST bindings in", sourceFile.getFilePath());
    }
}
console.log("Total files modernized:", modded);
