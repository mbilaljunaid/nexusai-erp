import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export function PublicBudgetProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Budget Planning & Variance Analysis"
      processCode="P012"
      criticality="CRITICAL"
      category="Finance"
      cycletime="Annual"
      description="Comprehensive annual budget planning with department budgets, GL loading, and variance analysis"
      flowSteps={[
        { label: 'Assumptions', description: 'Corporate assumptions for volume, pricing, inflation' },
        { label: 'Department Budgets', description: 'Bottom-up budgets by revenue, expense, capital' },
        { label: 'Consolidation', description: 'Finance consolidates and validates totals' },
        { label: 'GL Loading', description: 'Budget loaded as memo GL entries' },
        { label: 'Analysis', description: 'Monthly actual vs budget variance analysis' },
        { label: 'Approval', description: 'Executive approval and Board presentation' }
      ]}
      moduleMappings={[
        {
          module: 'Planning',
          forms: ['Budget Assumptions', 'Department Budget', 'Budget Consolidation'],
          impact: 'Budget planning and consolidation'
        },
        {
          module: 'Finance',
          forms: ['GL Budget', 'Budget Entry', 'Budget Version', 'Budget Lock'],
          impact: 'GL budget master and entries'
        },
        {
          module: 'Analysis',
          forms: ['Variance Report', 'Budget vs Actual', 'Trend Analysis', 'Forecast Update'],
          impact: 'Variance analysis and reporting'
        },
        {
          module: 'General Ledger',
          forms: ['Budget Memo Entry', 'Variance Calculation', 'GL Budget Posting'],
          impact: 'Budget GL integration'
        }
      ]}
      keyBenefits={[
        'Budget cycle completed in 45 days',
        'Department submission rate of 98%',
        'Actual vs budget variance of 2.1%',
        'Forecast accuracy improved to 94%',
        'Monthly variance reports on-time',
        'Re-forecast triggers managed (3 per year)'
      ]}
      glAccounts={['GL-3000', 'GL-3100']}
    />
  );
}
