import { Project, SyntaxKind, CallExpression } from 'ts-morph';
import fs from 'fs';
import path from 'path';

const project = new Project({
    tsConfigFilePath: './tsconfig.json',
});

// Only target pages and components for UI standardization
const sourceFiles = project.getSourceFiles(['src/pages/**/*.tsx', 'src/components/**/*.tsx']);

let fetchInUseEffectCount = 0;
let fetchInUseQueryCount = 0;
let fetchOutsideCount = 0;

console.log(`Analyzing ${sourceFiles.length} files for fetch patterns...`);

sourceFiles.forEach(sourceFile => {
    const fetchCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).filter(call => {
        return call.getExpression().getText() === 'fetch';
    });

    if (fetchCalls.length > 0) {
        fetchCalls.forEach(fetchCall => {
            let inUseEffect = false;
            let inUseQuery = false;

            let parent = fetchCall.getParent();
            while (parent) {
                if (parent.getKind() === SyntaxKind.CallExpression) {
                    const callExpr = parent as CallExpression;
                    const exprText = callExpr.getExpression().getText();
                    if (exprText === 'useEffect') {
                        inUseEffect = true;
                        break;
                    }
                    if (exprText === 'useQuery' || exprText === 'useMutation') {
                        inUseQuery = true;
                        break;
                    }
                }
                parent = parent.getParent();
            }

            if (inUseQuery) {
                fetchInUseQueryCount++;
            } else if (inUseEffect) {
                fetchInUseEffectCount++;
                console.log(`[useEffect Match]: ${sourceFile.getFilePath()}`);
            } else {
                fetchOutsideCount++;
            }
        });
    }
});

console.log(`\n--- Fetch Analysis Results ---`);
console.log(`Already standardized in TanStack Query: ${fetchInUseQueryCount}`);
console.log(`Inside useEffect (Query Candidates): ${fetchInUseEffectCount}`);
console.log(`Outside useEffect (Mutation/Handler Candidates): ${fetchOutsideCount}`);
