import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export function PublicFixedAssetProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Fixed Asset Lifecycle"
      processCode="P007"
      criticality="HIGH"
      category="Finance"
      cycletime="Lifecycle"
      description="Complete asset management from acquisition through depreciation tracking and disposal"
      flowSteps={[
        { label: 'Requisition', description: 'Asset requisition with business justification' },
        { label: 'Approval', description: 'Capital investment approval and funding' },
        { label: 'Receipt', description: 'Asset receipt and inspection' },
        { label: 'Activation', description: 'Asset placed in service with depreciation setup' },
        { label: 'Depreciation', description: 'Monthly depreciation posting to GL' },
        { label: 'Disposal', description: 'End-of-life asset retirement and gain/loss' }
      ]}
      moduleMappings={[
        {
          module: 'Fixed Assets',
          forms: ['Asset Master', 'Asset Location', 'Depreciation Schedule', 'Asset Tag'],
          impact: 'Asset master data and tracking'
        },
        {
          module: 'Finance',
          forms: ['Asset Addition', 'Asset Depreciation', 'Asset Disposal', 'Asset Impairment'],
          impact: 'Asset accounting and financial reporting'
        },
        {
          module: 'Maintenance',
          forms: ['Maintenance Request', 'Maintenance Schedule', 'Repair Cost', 'Maintenance History'],
          impact: 'Asset maintenance and repair tracking'
        },
        {
          module: 'General Ledger',
          forms: ['GL Journal Entry', 'Asset GL Posting', 'Depreciation Expense', 'Gain/Loss Entry'],
          impact: 'Asset-related GL postings'
        }
      ]}
      keyBenefits={[
        'Asset utilization tracked and optimized at 82%+',
        '100% depreciation accuracy with automated calculations',
        '95% asset disposal timeliness with proper accounting',
        'Real-time asset ROI analysis and performance tracking',
        'Maintenance cost optimization (2.1% of asset value)',
        'Complete audit trail for asset accountability'
      ]}
      glAccounts={['GL-1500', 'GL-1501', 'GL-6200', 'GL-6300', 'GL-6900']}
    />
  );
}
