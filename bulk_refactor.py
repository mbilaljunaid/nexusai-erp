import os
import re

files_to_process = [
    "src/pages/manufacturing/WorkCenterManager.tsx",
    "src/pages/manufacturing/StandardOpLibrary.tsx",
    "src/pages/RevenueContractWorkbench.tsx",
    "src/pages/EnvironmentManagement.tsx",
    "src/pages/JournalEntries.tsx",
    "src/pages/ExpensesDetail.tsx",
    "src/pages/ExpenseTracking.tsx",
    "src/pages/procurement/RequisitionBoard.tsx",
    "src/pages/procurement/PurchaseOrderList.tsx",
    "src/pages/MatchRuleList.tsx",
    "src/pages/gl/CoaStructureSetup.tsx",
    "src/pages/gl/TrialBalance.tsx",
    "src/pages/RevenueRuleManager.tsx",
    "src/pages/hr/selfservice/MyTimeCard.tsx",
    "src/pages/hr/selfservice/DelegationWorkbench.tsx",
    "src/pages/hr/selfservice/VoluntaryDeductions.tsx",
    "src/pages/hr/learning/admin/CourseCatalogAdmin.tsx",
    "src/pages/hr/learning/instructor/InstructorDashboard.tsx",
    "src/pages/SalesOrderManagement.tsx",
    "src/pages/SupplierManagement.tsx",
    "src/pages/ReferenceDataDetail.tsx",
    "src/pages/finance/ap/APSystemConfig.tsx",
    "src/pages/finance/ap/SupplierPortal.tsx",
    "src/pages/finance/ap/APSupplierDetail.tsx",
    "src/pages/finance/ap/PaymentTermsMaster.tsx",
    "src/pages/finance/ap/APReports.tsx",
    "src/pages/finance/ap/APPaymentBatches.tsx",
    "src/pages/finance/ap/APPrepayments.tsx",
    "src/pages/finance/ap/CreatePPR.tsx",
    "src/pages/finance/ap/APInvoices.tsx",
    "src/pages/finance/ap/APSuppliers.tsx",
    "src/pages/finance/ap/APQuickPayment.tsx",
    "src/pages/finance/ap/APInvoiceDetail.tsx",
    "src/pages/finance/ar/AutoInvoiceWorkbench.tsx"
]

base_dir = "/Users/mbjunaid/My Projects/nexusai-erp-2"

count = 0

for file_path in files_to_process:
    full_path = os.path.join(base_dir, file_path)
    if not os.path.exists(full_path):
        continue
        
    with open(full_path, 'r') as f:
        content = f.read()
        
    original = content
        
    # 1. Replace imports (also handles table/ui variations)
    content = re.sub(
        r'import\s+\{[^}]*?(StandardTable|Column)[^}]*?\}\s+from\s+["\']@/components/(ui|tables)/StandardTable["\'];?',
        r'import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";',
        content
    )
    
    # 2. Replace Column types
    content = re.sub(r'\bColumn<([^>]+)>', r'SpreadsheetColumn<\1>', content)
    content = re.sub(r':\s*Column\[\]', r': SpreadsheetColumn<any>[]', content)

    # 3. Replace accessorKey with id
    content = re.sub(r'accessorKey:\s*(["\']\w+["\'])', r'id: \1, width: "150px"', content)
    
    # 4. Replace StandardTable element
    def replacer(match):
        props = match.group(1)
        # remove unwanted props correctly by parsing
        # (This simplistic regex works for inline string/number/brace props)
        props = re.sub(r'\s*keyExtractor=\{[^}]*\}', '', props)
        props = re.sub(r'\s*page=\{[^}]*\}', '', props)
        props = re.sub(r'\s*pageSize=\{[^}]*\}', '', props)
        props = re.sub(r'\s*totalItems=\{[^}]*\}', '', props)
        props = re.sub(r'\s*onPageChange=\{[^}]*\}', '', props)
        props = re.sub(r'\s*filterColumn=["\'][^"\']*["\']', '', props)
        props = re.sub(r'\s*filterPlaceholder=["\'][^"\']*["\']', '', props)
        
        return f'<InteractiveSpreadsheet{props} onChange={{() => {{}}}} containerHeight="600px" />'
        
    content = re.sub(r'<StandardTable([\s\S]*?)\/>', replacer, content)
    
    if content != original:
        with open(full_path, 'w') as f:
            f.write(content)
        print(f"Refactored {file_path}")
        count += 1

print(f"Refactored {count} files.")
