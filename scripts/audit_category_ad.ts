import { Project, SyntaxKind } from "ts-morph";
import * as fs from "fs";

/**
 * AUDIT: Category AD — Icon-Only Buttons Missing aria-label
 *
 * Scans all src/pages/ and src/components/ (excluding ui/) for
 * <Button size="icon"> elements that do not have an aria-label attribute.
 *
 * Writes category_ad_violations.json with the list of affected files.
 */

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
    skipAddingFilesFromTsConfig: false,
});

interface Violation {
    file: string;
    line: number;
    childIcon: string;
}

let violations: Violation[] = 0 as unknown as Violation[];
violations = [];
const affectedFiles = new Set<string>();

const sourceFiles = project.getSourceFiles([
    "src/pages/**/*.tsx",
    "src/components/**/*.tsx",
]);

for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();

    // Skip the canonical Shadcn UI primitives directory
    if (filePath.includes("src/components/ui/")) continue;

    const jsxElements = [
        ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
    ];

    for (const element of jsxElements) {
        const tagName = element.getTagNameNode().getText();
        if (tagName !== "Button") continue;

        const attrs = element.getAttributes();

        // Must have size="icon" or size={'icon'}
        const hasSizeIcon = attrs.some(attr => {
            if (attr.getKind() !== SyntaxKind.JsxAttribute) return false;
            const a = attr.asKindOrThrow(SyntaxKind.JsxAttribute);
            if (a.getNameNode().getText() !== "size") return false;
            const init = a.getInitializer();
            if (!init) return false;
            return init.getText().replace(/['"{}]/g, "") === "icon";
        });

        if (!hasSizeIcon) continue;

        // Must NOT already have aria-label
        const hasAriaLabel = attrs.some(attr => {
            if (attr.getKind() !== SyntaxKind.JsxAttribute) return false;
            return attr.asKindOrThrow(SyntaxKind.JsxAttribute).getNameNode().getText() === "aria-label";
        });

        if (hasAriaLabel) continue;

        // Try to extract child icon name from parent JsxElement
        let childIcon = "(unknown)";
        const parentElement = element.getParent();
        if (parentElement && parentElement.getKind() === SyntaxKind.JsxElement) {
            const children = parentElement.getJsxChildren();
            for (const child of children) {
                if (child.getKind() === SyntaxKind.JsxSelfClosingElement) {
                    const iconName = child.asKindOrThrow(SyntaxKind.JsxSelfClosingElement).getTagNameNode().getText();
                    if (/^[A-Z]/.test(iconName)) {
                        childIcon = iconName;
                        break;
                    }
                }
            }
        }

        violations.push({
            file: filePath,
            line: element.getStartLineNumber(),
            childIcon,
        });
        affectedFiles.add(filePath);
    }
}

console.log(`\nCategory AD Audit Complete!`);
console.log(`Violations found: ${violations.length}`);
console.log(`Affected files:   ${affectedFiles.size}`);
console.log(`\nIcon breakdown:`);

const iconCounts: Record<string, number> = {};
for (const v of violations) {
    iconCounts[v.childIcon] = (iconCounts[v.childIcon] ?? 0) + 1;
}
Object.entries(iconCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([icon, count]) => console.log(`  ${icon}: ${count}`));

fs.writeFileSync(
    "category_ad_violations.json",
    JSON.stringify({ totalViolations: violations.length, affectedFiles: violations.length, violations }, null, 2)
);
console.log(`\nDetailed report written to category_ad_violations.json`);
