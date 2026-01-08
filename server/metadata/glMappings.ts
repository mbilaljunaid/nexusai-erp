/**
 * GL Mappings Configuration - Phase 1 Deliverable
 * Maps all transaction forms to GL accounts for automated posting
 */

import { GLMappingConfig } from "@shared/types/metadata";

/**
 * Standard GL Account Chart
 */
export const GL_CHART_OF_ACCOUNTS = {
  // ASSET ACCOUNTS (1000-1999)
  "1000": { name: "Cash", type: "asset", debitNormal: true },
  "1100": { name: "Petty Cash", type: "asset", debitNormal: true },
  "1200": { name: "Accounts Receivable", type: "asset", debitNormal: true },
  "1210": { name: "Allowance for Doubtful Accounts", type: "asset", debitNormal: false },
  "1300": { name: "Inventory", type: "asset", debitNormal: true },
  "1310": { name: "Finished Goods", type: "asset", debitNormal: true },
  "1320": { name: "Work in Process", type: "asset", debitNormal: true },
  "1330": { name: "Raw Materials", type: "asset", debitNormal: true },
  "1400": { name: "Prepaid Expenses", type: "asset", debitNormal: true },
  "1410": { name: "Prepaid Insurance", type: "asset", debitNormal: true },
  "1420": { name: "Prepaid Rent", type: "asset", debitNormal: true },
  "1500": { name: "Equipment", type: "asset", debitNormal: true },
  "1510": { name: "Furniture & Fixtures", type: "asset", debitNormal: true },
  "1520": { name: "Vehicles", type: "asset", debitNormal: true },
  "1530": { name: "Buildings", type: "asset", debitNormal: true },
  "1600": { name: "Accumulated Depreciation", type: "asset", debitNormal: false },
  "1610": { name: "Accumulated Depreciation - Equipment", type: "asset", debitNormal: false },

  // LIABILITY ACCOUNTS (2000-2999)
  "2000": { name: "Accounts Payable", type: "liability", creditNormal: true },
  "2100": { name: "Accrued Expenses", type: "liability", creditNormal: true },
  "2110": { name: "Accrued Salaries", type: "liability", creditNormal: true },
  "2120": { name: "Accrued Interest", type: "liability", creditNormal: true },
  "2130": { name: "Accrued Taxes", type: "liability", creditNormal: true },
  "2200": { name: "Short-term Debt", type: "liability", creditNormal: true },
  "2210": { name: "Short-term Loan", type: "liability", creditNormal: true },
  "2220": { name: "Current Portion of Long-term Debt", type: "liability", creditNormal: true },
  "2300": { name: "Unearned Revenue", type: "liability", creditNormal: true },
  "2400": { name: "Deferred Tax Liability", type: "liability", creditNormal: true },

  // EQUITY ACCOUNTS (3000-3999)
  "3000": { name: "Common Stock", type: "equity", creditNormal: true },
  "3100": { name: "Retained Earnings", type: "equity", creditNormal: true },
  "3200": { name: "Dividends", type: "equity", debitNormal: true },

  // REVENUE ACCOUNTS (4000-4999)
  "4000": { name: "Product Revenue", type: "revenue", creditNormal: true },
  "4010": { name: "Sales Revenue", type: "revenue", creditNormal: true },
  "4020": { name: "Service Revenue", type: "revenue", creditNormal: true },
  "4030": { name: "Rental Revenue", type: "revenue", creditNormal: true },
  "4100": { name: "Other Revenue", type: "revenue", creditNormal: true },
  "4110": { name: "Interest Income", type: "revenue", creditNormal: true },
  "4120": { name: "Consulting Revenue", type: "revenue", creditNormal: true },

  // EXPENSE ACCOUNTS (5000-6999)
  "5000": { name: "Cost of Goods Sold", type: "expense", debitNormal: true },
  "5010": { name: "Inventory Purchases", type: "expense", debitNormal: true },
  "5020": { name: "Materials Used", type: "expense", debitNormal: true },
  "5100": { name: "Employee Compensation", type: "expense", debitNormal: true },
  "5110": { name: "Salaries", type: "expense", debitNormal: true },
  "5120": { name: "Wages", type: "expense", debitNormal: true },
  "5130": { name: "Benefits", type: "expense", debitNormal: true },
  "5140": { name: "Bonuses", type: "expense", debitNormal: true },
  "5150": { name: "Payroll Taxes", type: "expense", debitNormal: true },
  "5200": { name: "Office Supplies", type: "expense", debitNormal: true },
  "5300": { name: "Utilities", type: "expense", debitNormal: true },
  "5310": { name: "Electricity", type: "expense", debitNormal: true },
  "5320": { name: "Water & Sewer", type: "expense", debitNormal: true },
  "5330": { name: "Internet & Phone", type: "expense", debitNormal: true },
  "5400": { name: "Rent Expense", type: "expense", debitNormal: true },
  "5500": { name: "Maintenance & Repairs", type: "expense", debitNormal: true },
  "5600": { name: "Depreciation Expense", type: "expense", debitNormal: true },
  "6000": { name: "Professional Services", type: "expense", debitNormal: true },
  "6010": { name: "Accounting Fees", type: "expense", debitNormal: true },
  "6020": { name: "Legal Fees", type: "expense", debitNormal: true },
  "6030": { name: "Consulting Fees", type: "expense", debitNormal: true },
  "6100": { name: "Marketing Expenses", type: "expense", debitNormal: true },
  "6110": { name: "Advertising", type: "expense", debitNormal: true },
  "6120": { name: "Social Media Marketing", type: "expense", debitNormal: true },
  "6200": { name: "Travel Expenses", type: "expense", debitNormal: true },
  "6210": { name: "Meals & Entertainment", type: "expense", debitNormal: true },
  "6220": { name: "Hotel & Lodging", type: "expense", debitNormal: true },
  "6300": { name: "Insurance Expense", type: "expense", debitNormal: true },
  "6400": { name: "Interest Expense", type: "expense", debitNormal: true },
  "6500": { name: "Bank Fees", type: "expense", debitNormal: true },
  "6600": { name: "Miscellaneous Expense", type: "expense", debitNormal: true },
};

/**
 * Form-Specific GL Mappings for Transaction Forms
 */
export const FORM_GL_MAPPINGS: Record<string, GLMappingConfig[]> = {
  // Finance Module
  invoices: [
    {
      account: "1200",
      debitCredit: "debit",
      amount: "dynamic",
      amountField: "amount",
      autoPost: true,
      description: "AR - Customer Invoice #{invoiceNumber}",
    },
    {
      account: "4000",
      debitCredit: "credit",
      amount: "dynamic",
      amountField: "amount",
      autoPost: true,
      description: "Revenue - Invoice #{invoiceNumber}",
    },
  ],

  expenses: [
    {
      account: "5000",
      debitCredit: "debit",
      amount: "dynamic",
      amountField: "amount",
      autoPost: true,
      description: "Expense - {category}",
    },
    {
      account: "1000",
      debitCredit: "credit",
      amount: "dynamic",
      amountField: "amount",
      autoPost: true,
      description: "Cash Payment for Expense",
    },
  ],

  payments: [
    {
      account: "1000",
      debitCredit: "debit",
      amount: "dynamic",
      amountField: "amount",
      autoPost: true,
      description: "Cash Received - Payment #{paymentNumber}",
    },
    {
      account: "1200",
      debitCredit: "credit",
      amount: "dynamic",
      amountField: "amount",
      autoPost: true,
      description: "AR Reduction - Invoice #{invoiceId}",
    },
  ],

  purchaseOrders: [
    {
      account: "1300",
      debitCredit: "debit",
      amount: "dynamic",
      amountField: "amount",
      autoPost: false,
      description: "Inventory - PO #{poNumber}",
    },
    {
      account: "2000",
      debitCredit: "credit",
      amount: "dynamic",
      amountField: "amount",
      autoPost: false,
      description: "AP - PO #{poNumber}",
    },
  ],

  // HR Module
  payroll: [
    {
      account: "5100",
      debitCredit: "debit",
      amount: "dynamic",
      amountField: "grossAmount",
      autoPost: true,
      description: "Payroll - {employeeName}",
    },
    {
      account: "1000",
      debitCredit: "credit",
      amount: "dynamic",
      amountField: "netAmount",
      autoPost: true,
      description: "Cash - Payroll Payment",
    },
    {
      account: "2110",
      debitCredit: "credit",
      amount: "dynamic",
      amountField: "taxWithheld",
      autoPost: true,
      description: "Payroll Tax Liability",
    },
  ],

  // ERP Module
  requisitions: [
    {
      account: "1300",
      debitCredit: "debit",
      amount: "dynamic",
      amountField: "amount",
      autoPost: false,
      description: "Inventory Request - {itemName}",
    },
  ],

  // Projects Module
  projects: [
    {
      account: "1500",
      debitCredit: "debit",
      amount: "dynamic",
      amountField: "budget",
      autoPost: false,
      description: "Project Asset - {projectName}",
    },
  ],

  // Budget Module
  budgets: [
    {
      account: "5000",
      debitCredit: "debit",
      amount: "dynamic",
      amountField: "budgetAmount",
      autoPost: false,
      description: "Budget Allocation - {department}",
    },
  ],
};

/**
 * Get GL mappings for a form
 */
export function getGLMappingsForForm(formId: string): GLMappingConfig[] {
  return FORM_GL_MAPPINGS[formId] || [];
}

/**
 * Check if GL account exists
 */
export function isValidGLAccount(account: string): boolean {
  return account in GL_CHART_OF_ACCOUNTS;
}

/**
 * Get GL account details
 */
export function getGLAccountDetails(account: string): any {
  return GL_CHART_OF_ACCOUNTS[account as keyof typeof GL_CHART_OF_ACCOUNTS] || null;
}
