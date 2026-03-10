const { Project, SyntaxKind } = require("ts-morph");

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles("src/pages/**/*.{ts,tsx}");
let modifiedCount = 0;

sourceFiles.forEach(sourceFile => {
    // Fast fail if it doesn't have custom tab markers
    if (!sourceFile.getFullText().includes("tabs-container")) return;

    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);
    let modified = false;

    for (const element of jsxElements) {
        if (element.wasForgotten()) continue;
        const openingElement = element.getOpeningElement();
        if (openingElement.getTagNameNode().getText() === "div") {
            const classNameAttr = openingElement.getAttribute("className");
            if (classNameAttr && classNameAttr.getText().includes("tabs-container")) {
                console.log(`Found fragmented tabs array in ${sourceFile.getFilePath()}`);

                // Inject the Shadcn Imports safely identifying root
                let hasTabsImport = false;
                sourceFile.getImportDeclarations().forEach(imp => {
                    if (imp.getModuleSpecifierValue() === "@/components/ui/tabs") hasTabsImport = true;
                });

                if (!hasTabsImport) {
                    sourceFile.addImportDeclaration({
                        namedImports: ["Tabs", "TabsContent", "TabsList", "TabsTrigger"],
                        moduleSpecifier: "@/components/ui/tabs"
                    });
                }

                // Explicitly transform the hardcoded mapping container into the semantic equivalent
                if (sourceFile.getFilePath().includes("RegulatoryCalendar.tsx")) {
                    element.replaceWithText(`
            <Tabs defaultValue="calendar" value={tab as any} onValueChange={setTab as any} className="w-full mb-6">
                <TabsList className="mb-4">
                    <TabsTrigger value="calendar" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Events ({events.length})</TabsTrigger>
                    <TabsTrigger value="fcpa" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">FCPA Training</TabsTrigger>
                    <TabsTrigger value="new" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">+ New Event</TabsTrigger>
                </TabsList>
            </Tabs>
                    `.trim());
                    modified = true;
                    break; // Break to avoid forgotten node errors
                }
            }
        }
    }

    if (modified) {
        sourceFile.saveSync();
        console.log(`Re-constructed AST bindings natively into <Tabs> in ${sourceFile.getFilePath()}`);
        modifiedCount++;
    }
});

console.log(`Total files modernized correctly: ${modifiedCount}`);
