import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths(['src/pages/**/*.tsx', 'src/components/**/*.tsx']);

let filesWithMissingFooters = 0;

for (const sourceFile of project.getSourceFiles()) {
  if (sourceFile.getFilePath().includes('components/ui/')) continue;
  
  const text = sourceFile.getFullText();
  const isDialog = text.includes('DialogContent') || text.includes('SheetContent');
  if (!isDialog) continue;
  
  // Does it already have a DialogFooter / SheetFooter?
  const hasFooter = text.includes('DialogFooter') || text.includes('SheetFooter');
  
  if (!hasFooter) {
     // Check if there are buttons in the dialog/sheet at all
     // We can just dump any file that has DialogContent but no DialogFooter, and has Buttons
     const hasButtons = text.includes('<Button') || text.includes('<button');
     if (hasButtons) {
         console.log(`Missing Footer: ${sourceFile.getBaseName()}`);
         filesWithMissingFooters++;
     }
  }
}

console.log(`Files with Dialog/Sheet lacking Footers: ${filesWithMissingFooters}`);
