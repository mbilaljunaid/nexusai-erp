import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export function PublicContractProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Contract Management"
      processCode="P011"
      criticality="HIGH"
      category="Finance"
      cycletime="18-30 days"
      description="End-to-end contract lifecycle from requirements through renewal with revenue recognition controls"
      flowSteps={[
        { label: 'Requirements', description: 'Identify contract need and key terms' },
        { label: 'Draft', description: 'Create contract using approved templates' },
        { label: 'Review', description: 'Legal, Finance, and Executive review' },
        { label: 'Execution', description: 'Sign contract and obtain counterparty signature' },
        { label: 'Management', description: 'Monitor compliance and amendments' },
        { label: 'Renewal', description: 'Renewal negotiation or termination' }
      ]}
      moduleMappings={[
        {
          module: 'Contract Management',
          forms: ['Contract Master', 'Contract Template', 'Contract Version', 'Amendment'],
          impact: 'Contract data management and versioning'
        },
        {
          module: 'Finance',
          forms: ['Revenue Contract', 'Expense Contract', 'Service Contract', 'Lease'],
          impact: 'Contract financial terms and conditions'
        },
        {
          module: 'Compliance',
          forms: ['Legal Review', 'Risk Assessment', 'Compliance Check', 'Sign-Off'],
          impact: 'Contract review and approval'
        },
        {
          module: 'General Ledger',
          forms: ['Deferred Revenue', 'Revenue Recognition', 'Contract GL Entry'],
          impact: 'ASC 606 compliant revenue accounting'
        }
      ]}
      keyBenefits={[
        'Contract cycle time reduced to 18 days',
        'On-time renewals at 99%+',
        'Revenue recognition accuracy at 100%',
        'Amendment response time of 2.1 days',
        'Complete compliance status at 100%',
        'Reduced contract disputes and claims'
      ]}
      glAccounts={['GL-2500', 'GL-4100']}
    />
  );
}
