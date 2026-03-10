import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths(['src/pages/**/*.tsx', 'src/components/**/*.tsx']);

let filesModded = 0;

for (const sourceFile of project.getSourceFiles()) {
  let fileChanged = false;
  
  if (sourceFile.getFilePath().includes('components/ui/')) continue;
  if (!sourceFile.getFullText().includes('justify-end')) continue;

  const text = sourceFile.getFullText();
  const isDialog = text.includes('<DialogContent') || text.includes('<DialogHeader');
  const isSheet = text.includes('<SheetContent') || text.includes('<SheetHeader');
  
  if (!isDialog && !isSheet) continue;

  const targetFooter = isDialog ? 'DialogFooter' : 'SheetFooter';
  const importTarget = isDialog ? 'dialog' : 'sheet';

  const divs = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement).filter(e => e.getTagNameNode().getText() === 'div');

  for (const opening of divs) {
    const classNameAttr = opening.getAttribute('className');
    if (!classNameAttr || classNameAttr.getKind() !== SyntaxKind.JsxAttribute) continue;

    const classNameVal = classNameAttr.getInitializer()?.getText() || '';
    
    // Loosen match criteria: just needs to have flex and justify-end in the same className string
    if (!classNameVal.includes('justify-end') || !classNameVal.includes('flex')) continue;

    // Check if it's wrapping buttons
    const parent = opening.getParent();
    if (parent.getKind() !== SyntaxKind.JsxElement) continue;

    const hasButtons = parent.getDescendantsOfKind(SyntaxKind.JsxOpeningElement).some(el => {
        const tag = el.getTagNameNode().getText();
        return tag === 'Button' || tag === 'button';
    });

    if (hasButtons) {
      const closing = parent.getClosingElement();
      if (!closing) continue;
      
      opening.getTagNameNode().replaceWithText(targetFooter);
      closing.getTagNameNode().replaceWithText(targetFooter);
      
      // Clean up the styling attributes
      try {
          classNameAttr.remove();
      } catch (e) {}

      fileChanged = true;
    }
  }

  if (fileChanged) {
    const uiImport = sourceFile.getImportDeclarations().find(imp => imp.getModuleSpecifierValue() === `@/components/ui/${importTarget}`);

    if (uiImport) {
      if (!uiImport.getNamedImports().some(ni => ni.getName() === targetFooter)) {
        uiImport.addNamedImport(targetFooter);
      }
    } else {
      sourceFile.addImportDeclaration({
        namedImports: [targetFooter],
        moduleSpecifier: `@/components/ui/${importTarget}`
      });
    }

    sourceFile.saveSync();
    filesModded++;
    console.log(`[Category AM] Fixed footer in ${sourceFile.getBaseName()}`);
  }
}

console.log(`Total files modified: ${filesModded}`);
