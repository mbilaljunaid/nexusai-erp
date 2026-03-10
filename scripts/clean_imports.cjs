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

    // 1. Remove ANY line containing 'dateUtils' completely
    const lines = content.split('\n');
    const cleanLines = lines.filter(line => !line.includes('@/lib/dateUtils'));
    content = cleanLines.join('\n');

    // Remove any stranded "import { formatDate, " that might be on line 1
    if (content.startsWith('import { formatDate, \n')) {
        content = content.replace('import { formatDate, \n', '');
    }
    if (content.startsWith('import { formatDateTime, \n')) {
        content = content.replace('import { formatDateTime, \n', '');
    }

    // 2. See what functions are actually used
    let funcs = new Set();
    if (content.includes('formatDate(')) funcs.add('formatDate');
    if (content.includes('formatDateTime(')) funcs.add('formatDateTime');
    if (content.includes('formatTime(')) funcs.add('formatTime');

    // 3. Prepend exact correct import
    if (funcs.size > 0) {
        content = `import { ${Array.from(funcs).join(', ')} } from "@/lib/dateUtils";\n` + content;
    }

    // A hack for files where the `} from "recharts";` got broken, let's fix it manually too
    if (content.includes('} from "recharts";') && !content.includes('import {') && content.indexOf('} from "recharts";') < 200) {
        // This implies the start of the import block was deleted
        console.log('Needs recharts fix: ' + relPath);
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned ${relPath}`);
}
