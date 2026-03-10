const { Project, SyntaxKind } = require("ts-morph");
const path = require("path");

const project = new Project({
    tsConfigFilePath: "/Users/mbjunaid/My Projects/nexusai-erp-2/tsconfig.json",
    skipAddingFilesFromTsConfig: true,
});

project.addSourceFilesAtPaths([
    "/Users/mbjunaid/My Projects/nexusai-erp-2/src/pages/**/*.tsx",
    "/Users/mbjunaid/My Projects/nexusai-erp-2/src/components/**/*.tsx",
    "/Users/mbjunaid/My Projects/nexusai-erp-2/src/services/**/*.ts"
]);

let fixedCount = 0;
const sourceFiles = project.getSourceFiles();

for (const sourceFile of sourceFiles) {
    let modified = false;

    // Fix imports typos like '@tantml:react-query' -> '@tanstack/react-query'
    const imports = sourceFile.getImportDeclarations();
    for (const imp of imports) {
        const modSpec = imp.getModuleSpecifierValue();
        if (modSpec === '@tantml:react-query') {
            imp.setModuleSpecifier('@tanstack/react-query');
            modified = true;
        } else if (modSpec === '@/lib/supabase') {
            imp.setModuleSpecifier('@/lib/db');
            modified = true;
        } else if (modSpec === '@/lib/store/enterprise') {
            imp.setModuleSpecifier('@/lib/enterpriseStore');
            modified = true;
        }
    }

    // Fix apiRequest calls using safe loop
    let changedInLoop = true;
    while (changedInLoop) {
        changedInLoop = false;
        const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
        for (const callExpr of callExpressions) {
            try {
                // Must get it fresh each time; if destroyed, getExpression() throws
                const expression = callExpr.getExpression();
                if (expression.getText() === "apiRequest") {
                    const args = callExpr.getArguments();

                    // If it's `apiRequest(URL)` -> just 1 argument
                    if (args.length === 1) {
                        const urlArg = args[0].getText();
                        callExpr.replaceWithText(`apiRequest("GET", ${urlArg}).then(res => res.json())`);
                        modified = true;
                        changedInLoop = true;
                        break; // Restart while loop
                    }

                    // If it's `apiRequest(URL, { method: "POST", ... })`
                    if (args.length === 2 && args[1].getKind() === SyntaxKind.ObjectLiteralExpression) {
                        const urlArg = args[0].getText();
                        const objExpr = args[1];
                        const methodProp = objExpr.getProperty("method");
                        if (methodProp && methodProp.getKind() === SyntaxKind.PropertyAssignment) {
                            const methodVal = methodProp.getInitializer().getText(); // e.g. "POST"

                            const bodyProp = objExpr.getProperty("body");
                            let bodyArg = "undefined";
                            if (bodyProp && bodyProp.getKind() === SyntaxKind.PropertyAssignment) {
                                const bodyEnv = bodyProp.getInitializer();
                                if (bodyEnv.getKind() === SyntaxKind.CallExpression && bodyEnv.getExpression().getText() === "JSON.stringify") {
                                    bodyArg = bodyEnv.getArguments()[0].getText();
                                } else {
                                    bodyArg = bodyEnv.getText();
                                }
                            }

                            if (bodyArg !== "undefined") {
                                callExpr.replaceWithText(`apiRequest(${methodVal}, ${urlArg}, ${bodyArg})`);
                            } else {
                                callExpr.replaceWithText(`apiRequest(${methodVal}, ${urlArg})`);
                            }
                            modified = true;
                            changedInLoop = true;
                            break; // Restart while loop
                        }
                    }
                }
            } catch (e) {
                // Node removed, ignore and continue in the inner loop
            }
        }
    }

    if (modified) {
        sourceFile.saveSync();
        fixedCount++;
        console.log(`Fixed ${sourceFile.getFilePath()}`);
    }
}

console.log(`Successfully fixed TS errors in ${fixedCount} files.`);
