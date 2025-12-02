import { PublicProcessTemplate } from "./PublicProcessTemplate";

export default function PublicMonthEndProcess() {
  const steps = [
    { name: "GL Transactions", description: "All operational transactions posted to GL", glAccounts: ["GL-1000"] },
    { name: "GL Reconciliation", description: "Bank, account, and subledger reconciliations", glAccounts: ["GL-2100"] },
    { name: "Accruals & Adjustments", description: "Month-end accruals and audit adjustments", glAccounts: ["GL-3000"] },
    { name: "Intercompany Elimination", description: "Eliminate intercompany transactions", glAccounts: ["GL-3500"] },
    { name: "Financial Statements", description: "Generate balance sheet, P&L, cash flow", glAccounts: ["GL-5000"] },
    { name: "Audit Review", description: "Internal/external audit and sign-off", glAccounts: ["GL-9000"] },
  ];

  const kpis = [
    { metric: "Close Days", target: "5 days", current: "4 days" },
    { metric: "Reconciliation Variance", target: "$0", current: "$0" },
    { metric: "Audit Issues", target: "0", current: "0" },
  ];

  return <PublicProcessTemplate title="Month-End Consolidation" description="Financial period close and consolidation" steps={steps} kpis={kpis} />;
}
