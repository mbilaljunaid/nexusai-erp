import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export function PublicMonthEndProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Month-End Consolidation"
      processCode="P004"
      criticality="CRITICAL"
      category="Finance"
      cycletime="Monthly"
      description="Complete financial close from GL reconciliation through consolidated financial statements"
      flowSteps={[
        { label: 'GL Reconciliation', description: 'Reconcile all GL accounts to source systems' },
        { label: 'Accruals', description: 'Record period-end accruals and adjustments' },
        { label: 'Intercompany', description: 'Eliminate intercompany transactions' },
        { label: 'Consolidation', description: 'Consolidate subsidiary results to corporate' },
        { label: 'Statements', description: 'Generate balance sheet, income statement, cash flow' },
        { label: 'Audit', description: 'External audit and compliance review' }
      ]}
      moduleMappings={[
        {
          module: 'General Ledger',
          forms: ['GL Reconciliation', 'Journal Entry', 'Accrual Entry', 'Adjustment'],
          impact: 'Core accounting with reconciliations and adjustments'
        },
        {
          module: 'Finance',
          forms: ['Balance Sheet', 'Income Statement', 'Cash Flow', 'Trial Balance'],
          impact: 'Financial statement preparation'
        },
        {
          module: 'Consolidation',
          forms: ['Intercompany Elimination', 'Consolidation Entry', 'Currency Translation'],
          impact: 'Multi-entity consolidation and eliminations'
        },
        {
          module: 'Reporting',
          forms: ['Financial Report', 'Audit Trail', 'Disclosure', 'Management Report'],
          impact: 'External and internal financial reporting'
        }
      ]}
      keyBenefits={[
        'Financial close completed in 5 business days (vs. 15 days)',
        '100% GL account reconciliation and variance analysis',
        'Automated journal entry creation and posting',
        'Real-time financial visibility during close',
        'Enhanced audit trail and compliance documentation',
        'Improved accuracy with reduced manual errors'
      ]}
      glAccounts={['GL-1000', 'GL-2000', 'GL-3000', 'GL-4000']}
    />
  );
}
