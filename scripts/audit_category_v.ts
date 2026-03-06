import { Project, SyntaxKind } from "ts-morph";
import * as fs from "fs";

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
});

const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");
let violations = 0;
const affectedFiles = new Set<string>();

for (const sourceFile of sourceFiles) {
    const text = sourceFile.getFullText();

    // Check if the file has state for page/currentPage
    if (text.includes("setPage(") || text.includes("setCurrentPage(") || text.includes("setPage =") || text.includes("setCurrentPage =")) {

        // We only care if it's NOT using the standard <Pagination> or <DataTable> components which have built-in pagination
        const imports = sourceFile.getImportDeclarations();
        const hasPaginationImport = imports.some(imp =>
            imp.getModuleSpecifierValue().includes("components/ui/pagination")
        );
        const hasDataTableImport = imports.some(imp =>
            imp.getModuleSpecifierValue().includes("DataTable")
        );

        // Some pages might just use standard <Pagination> but don't import it directly if they use custom DataTable.
        // Let's actually check for the existence of ad-hoc pagination buttons
        const stringRender = text;
        const hasAdHocButtons =
            (stringRender.includes("Previous") && stringRender.includes("Next") && stringRender.includes("onClick")) ||
            (stringRender.includes("disabled={currentPage === 1}") || stringRender.includes("disabled={page === 1}"));

        if (!hasPaginationImport && !hasDataTableImport && hasAdHocButtons) {
            affectedFiles.add(sourceFile.getFilePath());
            violations++;
        }
    }
}

console.log(`\nAd-hoc Pagination Audit Complete!`);
console.log(`Found ${violations} violations across ${affectedFiles.size} files.`);
fs.writeFileSync("category_v_violations.json", JSON.stringify(Array.from(affectedFiles), null, 2));
