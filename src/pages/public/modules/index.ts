// Module Pages Index
// Consolidated module category pages

// Core Module Categories
export { default as FinanceModulePage } from './FinanceModulePage';
export { default as HRModulePage } from './HRModulePage';
export { default as CRMModulePage } from './CRMModulePage';

/**
 * Module Registry - Consolidated Categories
 * Each module page combines all related features into one comprehensive page
 */
export const MODULE_REGISTRY = [
    // Core Finance Module (covers 8 finance features)
    {
        name: 'Finance & Accounting',
        slug: 'finance',
        category: 'Core ERP',
        available: true,
        features: ['General Ledger', 'Accounts Payable', 'Accounts Receivable', 'Cash Management', 'Fixed Assets', 'Expense Management', 'Revenue Recognition', 'Financial Reporting']
    },

    // Core HR Module (covers 8 HR features)
    {
        name: 'Human Resources & Talent',
        slug: 'hr',
        category: 'Core ERP',
        available: true,
        features: ['Core HR (HRIS)', 'Payroll', 'Time & Attendance', 'Benefits Administration', 'Talent Management', 'Recruitment (ATS)', 'Learning Management (LMS)', 'Compensation Management']
    },

    // Core CRM Module (covers 8 CRM/sales features)
    {
        name: 'CRM & Sales',
        slug: 'crm',
        category: 'Core ERP',
        available: true,
        features: ['Sales CRM', 'Lead Management', 'Opportunity Management', 'Account Management', 'Contact Management', 'Quote Management (CPQ)', 'Sales Orders', 'Customer Portal']
    },

    // TODO: Additional module categories to be added:
    // - Supply Chain Management (SCM)
    // - Manufacturing
    // - Projects & Services
    // - Platform & Technology
] as const;

export const MODULE_CATEGORIES = [
    'Core ERP',
    'Supply Chain',
    'Manufacturing',
    'Projects',
    'Platform',
    'Industry-Specific'
] as const;
