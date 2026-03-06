import { Project, SyntaxKind, JsxOpeningElement, JsxSelfClosingElement } from "ts-morph";
import * as fs from "fs";

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
});

const filePaths = JSON.parse(fs.readFileSync("category_v_violations.json", "utf-8"));
let fixedCount = 0;

for (const filePath of filePaths) {
    let modified = false;
    const sourceFile = project.getSourceFile(filePath);
    if (!sourceFile) continue;

    // We are looking for something like:
    // <Button onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
    // <span>Page {currentPage} of {totalPages}</span>
    // <Button onClick={() => setCurrentPage(p => p + 1)}>Next</Button>

    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);

    for (const jsxElement of jsxElements) {
        const text = jsxElement.getText();

        // Very basic heuristic for a pagination wrapper div
        if (text.includes("Previous") && text.includes("Next") && (text.includes("currentPage") || text.includes("page")) && text.includes("Button")) {
            // Is it a relatively small block?
            if (jsxElement.getDescendantsOfKind(SyntaxKind.JsxElement).length < 20) {
                // Determine the state variables
                const isSetCurrentPage = text.includes("setCurrentPage");
                const isSetPage = text.includes("setPage");
                const setter = isSetCurrentPage ? "setCurrentPage" : (isSetPage ? "setPage" : null);

                const isCurrentPage = text.includes("currentPage");
                const isPage = text.includes("page");
                const stateVar = isCurrentPage ? "currentPage" : (isPage ? "page" : "1");

                const totalVarMatch = text.match(/totalPages|Math\.ceil\([^)]+\)/);
                const totalVar = totalVarMatch ? totalVarMatch[0] : "1";

                if (setter) {
                    // Replace this whole JSX element with the Pagination component
                    const replacement = `
<Pagination className="mt-4">
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious 
        onClick={() => ${setter}(p => Math.max(1, p - 1))} 
        className={${stateVar} === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
      />
    </PaginationItem>
    <PaginationItem>
      <span className="text-sm font-medium mx-4">Page {${stateVar}} of {${totalVar}}</span>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext 
        onClick={() => ${setter}(p => p + 1)} 
        className={${stateVar} === ${totalVar} ? "pointer-events-none opacity-50" : "cursor-pointer"}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>`;
                    jsxElement.replaceWithText(replacement);
                    modified = true;
                    fixedCount++;
                    break; // Only replace the first one per file for safety
                }
            }
        }
    }

    if (modified) {
        // Add imports
        const paginationImports = ["Pagination", "PaginationContent", "PaginationItem", "PaginationNext", "PaginationPrevious"];

        let existingImport = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === "@/components/ui/pagination");

        if (existingImport) {
            for (const imp of paginationImports) {
                if (!existingImport.getNamedImports().some(n => n.getName() === imp)) {
                    existingImport.addNamedImport(imp);
                }
            }
        } else {
            sourceFile.addImportDeclaration({
                moduleSpecifier: "@/components/ui/pagination",
                namedImports: paginationImports
            });
        }

        sourceFile.saveSync();
    }
}

console.log(`\nCodemod Complete! Replaced ad-hoc pagination in ${fixedCount} locations.`);
