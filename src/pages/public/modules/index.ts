// Module Pages Index
// Exports all module pages for easy route configuration

// Finance Modules (Batch 1)
export { default as GeneralLedgerPage } from './GeneralLedgerPage';
export { default as AccountsPayablePage } from './AccountsPayablePage';
export { default as AccountsReceivablePage } from './AccountsReceivablePage';
export { default as CashManagementPage } from './CashManagementPage';
export { default as FixedAssetsPage } from './FixedAssetsPage';
export { default as ExpenseManagementPage } from './ExpenseManagementPage';
export { default as RevenueRecognitionPage } from './RevenueRecognitionPage';
export { default as FinancialReportingPage } from './FinancialReportingPage';

/**
 * Module page registry for navigation and routing
 * Batch 1: Core Finance (8 modules complete)
 */
export const MODULE_REGISTRY = [
    // Finance Modules - Batch 1 (Complete)
    { name: 'General Ledger', slug: 'general-ledger', category: 'Finance', available: true },
    { name: 'Accounts Payable', slug: 'accounts-payable', category: 'Finance', available: true },
    { name: 'Accounts Receivable', slug: 'accounts-receivable', category: 'Finance', available: true },
    { name: 'Cash Management', slug: 'cash-management', category: 'Finance', available: true },
    { name: 'Fixed Assets', slug: 'fixed-assets', category: 'Finance', available: true },
    { name: 'Expense Management', slug: 'expense-management', category: 'Finance', available: true },
    { name: 'Revenue Recognition', slug: 'revenue-recognition', category: 'Finance', available: true },
    { name: 'Financial Reporting', slug: 'financial-reporting', category: 'Finance', available: true },

    // TODO: Batch 2-11 modules (77 remaining)
    // Next batches:
    // Batch 2: Core HR (8 modules)
    // Batch 3: Core CRM (8 modules)
    // Batch 4: Core SCM (8 modules)
    // Batch 5: Manufacturing (8 modules)
    // Batch 6: Projects & Services (8 modules)
    // Batch 7: Additional Finance (7 modules)
    // Batch 8: Additional HR (7 modules)
    // Batch 9: Industry-Specific (8 modules)
    // Batch 10: Platform & Tech (8 modules)
    // Batch 11: Advanced Features (7 modules)
] as const;

export const MODULE_CATEGORIES = [
    'Finance',
    'HR',
    'CRM',
    'Supply Chain',
    'Manufacturing',
    'Projects',
    'Platform',
    'Industry-Specific'
] as const;
