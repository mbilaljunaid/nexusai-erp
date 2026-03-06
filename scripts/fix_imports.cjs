const fs = require('fs');
const path = require('path');

const filesToFix = [
    "src/components/cash/RevaluationDialog.tsx",
    "src/components/NexusAIPanel.tsx",
    "src/components/UserProfile.tsx",
    "src/pages/CorporateCardReconciliation.tsx",
    "src/pages/maintenance/AssetHealthDashboard.tsx",
    "src/pages/maintenance/CostManagementHub.tsx",
    "src/pages/manufacturing/CalendarManager.tsx",
    "src/pages/mdm/MDMAuditViewer.tsx",
    "src/pages/MyJobsDashboard.tsx",
    "src/pages/MyProposalsDashboard.tsx",
    "src/pages/projects/TransactionImport.tsx",
    "src/pages/TemplateManagement.tsx"
];

for (const relPath of filesToFix) {
    const file = path.join(__dirname, '../', relPath);
    let content = fs.readFileSync(file, 'utf8');

    // Extract the specific import statement to know what functions are imported
    let importsToKeep = new Set();
    const regex = /import\s+{\s*([^}]+)\s*}\s+from\s+["']@\/lib\/dateUtils["'];?\n?/g;

    let match;
    while ((match = regex.exec(content)) !== null) {
        // match[1] has things like "formatDate, formatDateTime"
        const funcs = match[1].split(',').map(s => s.trim());
        funcs.forEach(f => importsToKeep.add(f));
    }

    // Now remove ALL instances of this import from the content
    content = content.replace(regex, '');

    // And remove duplicate instances at the very beginning if my script added it there previously

    // Now construct the correct import statement
    if (importsToKeep.size > 0) {
        const importStatement = `import { ${Array.from(importsToKeep).join(', ')} } from "@/lib/dateUtils";\n`;
        content = importStatement + content;
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${relPath}`);
}
