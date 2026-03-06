const fs = require('fs');
const path = require('path');

const filesToFix = [
    "src/components/cash/RevaluationDialog.tsx",
    "src/components/NexusAIPanel.tsx",
    "src/components/UserProfile.tsx",
    "src/pages/maintenance/AssetHealthDashboard.tsx",
    "src/pages/maintenance/CostManagementHub.tsx",
    "src/pages/manufacturing/CalendarManager.tsx",
    "src/pages/mdm/MDMAuditViewer.tsx",
    "src/pages/MyJobsDashboard.tsx",
    "src/pages/MyProposalsDashboard.tsx"
];

for (const relPath of filesToFix) {
    const file = path.join(__dirname, '../', relPath);
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    let needsFormatDate = false;
    let needsFormatDateTime = false;
    let needsFormatTime = false;

    // 1. Replace new Date(X).toLocaleDateString(...)
    content = content.replace(/new Date\((.*?)\)\.toLocaleDateString\((.*?)\)/g, (match, p1, p2) => {
        needsFormatDate = true;
        return p1.trim() ? `formatDate(${p1})` : `formatDate(new Date())`;
    });

    // 2. Replace new Date(X).toLocaleTimeString(...)
    content = content.replace(/new Date\((.*?)\)\.toLocaleTimeString\((.*?)\)/g, (match, p1, p2) => {
        needsFormatTime = true;
        return p1.trim() ? `formatTime(${p1})` : `formatTime(new Date())`;
    });

    // 3. Replace new Date(X).toLocaleString(...)
    content = content.replace(/new Date\((.*?)\)\.toLocaleString\((.*?)\)/g, (match, p1, p2) => {
        needsFormatDateTime = true;
        return p1.trim() ? `formatDateTime(${p1})` : `formatDateTime(new Date())`;
    });

    if (content !== originalContent) {
        const imports = [];
        if (needsFormatDate && !content.includes('formatDate } from')) imports.push('formatDate');
        if (needsFormatDateTime && !content.includes('formatDateTime } from')) imports.push('formatDateTime');
        if (needsFormatTime && !content.includes('formatTime } from')) imports.push('formatTime');

        if (imports.length > 0) {
            const importStatement = `import { ${imports.join(', ')} } from "@/lib/dateUtils";\n`;
            // Simple robust injection at top
            content = importStatement + content;
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${relPath}`);
    }
}
