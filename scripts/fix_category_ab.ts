import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFiles = [
    'src/pages/CampaignsDetail.tsx',
    'src/pages/POSTerminalCheckout.tsx',
    'src/pages/realestate/RealEstateDashboard.tsx',
    'src/pages/ecommerce/ProductCatalogDashboard.tsx',
    'src/pages/ecommerce/EcommerceDashboard.tsx',
    'src/pages/energy/EnergyUtilityDashboard.tsx',
    'src/pages/admin/BackupRestoreManager.tsx',
    'src/pages/admin/SystemLogsViewer.tsx',
    'src/pages/admin/SystemHealthDashboard.tsx',
    'src/pages/lcm/TradeOperationDetails.tsx',
    'src/pages/lcm/LcmWorkbench.tsx',
    'src/pages/ProductsDetail.tsx',
    'src/pages/QuotesDetail.tsx',
    'src/pages/finance/cash/CashForecastingView.tsx',
    'src/pages/revenue/RevenueIntelligence.tsx',
    'src/pages/saas/CustomerHealthDashboard.tsx',
    'src/pages/saas/TrialPlanManagementDashboard.tsx',
    'src/pages/saas/MRRAnalyticsDashboard.tsx',
    'src/pages/saas/UsageAnalyticsDashboard.tsx',
    'src/pages/billing/BillingWorkbench.tsx',
    'src/pages/cost-management/CostAdjustmentApprovalWorkbench.tsx',
    'src/components/ap/ApSettings.tsx',
    'src/components/construction/bim/BIMViewer.tsx'
];

function addLoader2Import(content: string): string {
    if (content.includes('Loader2')) return content;

    // Check if lucide-react is already imported
    if (content.includes('from "lucide-react"') || content.includes("from 'lucide-react'")) {
        return content.replace(/from ['"]lucide-react['"];?/, (match) => {
            // Find the import declaration
            return match; // We actually need to replace the destructuring part 
        });
    } else {
        // Just add to top
        return `import { Loader2 } from "lucide-react";\n` + content;
    }
}

targetFiles.forEach(relPath => {
    const file = path.join(__dirname, '..', relPath);
    if (!fs.existsSync(file)) return;

    let content = fs.readFileSync(file, 'utf8');
    let modifications = 0;

    // Fix imports - robust approach
    if (!content.includes('Loader2')) {
        const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
        if (importMatch) {
            const symbols = importMatch[1].split(',').map(s => s.trim());
            symbols.push('Loader2');
            content = content.replace(importMatch[0], `import { ${symbols.join(', ')} } from "lucide-react"`);
        } else {
            content = `import { Loader2 } from "lucide-react";\n` + content;
        }
    }

    // 1. Standard 12x12 blue/primary spinner
    content = content.replace(/<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"><\/div>/g, () => { modifications++; return `<Loader2 className="h-12 w-12 animate-spin text-primary" />`; });
    content = content.replace(/<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"><\/div>/g, () => { modifications++; return `<Loader2 className="h-8 w-8 animate-spin text-primary" />`; });
    content = content.replace(/<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" \/>/g, () => { modifications++; return `<Loader2 className="h-8 w-8 animate-spin text-primary" />`; });

    // 2. 8x8 blue spinner
    content = content.replace(/<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"><\/div>/g, () => { modifications++; return `<Loader2 className="h-8 w-8 animate-spin text-blue-600" />`; });

    // 3. 4x4 white spinner
    content = content.replace(/<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"><\/div>/g, () => { modifications++; return `<Loader2 className="h-4 w-4 animate-spin text-white" />`; });

    // 4. Activity/Clock replaced by Loader2
    content = content.replace(/<Activity className="([^"]*)animate-spin([^"]*)" \/>/g, (match, p1, p2) => { modifications++; return `<Loader2 className="${p1}animate-spin${p2}" />`; });
    content = content.replace(/<Clock className="([^"]*)animate-spin([^"]*)" \/>/g, (match, p1, p2) => { modifications++; return `<Loader2 className="${p1}animate-spin${p2}" />`; });

    // 5. Raw circle character spinner
    content = content.replace(/<div className="animate-spin text-xl">◌<\/div>/g, () => { modifications++; return `<Loader2 className="w-5 h-5 animate-spin" />`; });

    // 6. Custom Revenue Intelligence spinner
    content = content.replace(/<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" \/>/g, () => { modifications++; return `<Loader2 className="h-8 w-8 animate-spin text-primary" />`; });

    // 7. BIM Viewer
    content = content.replace(/<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"><\/div>/g, () => { modifications++; return `<Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />`; });


    if (modifications > 0) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}: ${modifications} replacements`);
    } else {
        // Undo import if no mods
        // We'll just run tsc and clean Imports later if needed, but it's fine.
    }
});

console.log("Completed Category AB Loader Refactoring");
