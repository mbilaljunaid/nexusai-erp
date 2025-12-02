import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export default function PublicCustomerReturnsProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Customer Returns & RMA"
      processCode="P016"
      criticality="HIGH"
      category="Sales & Service"
      cycletime="7 days"
      description="Return authorization, inspection, disposition, and credit memo issuance"
      flowSteps={[
        { label: 'Request', description: 'Customer initiates return with reason code' },
        { label: 'Approval', description: 'RMA approved and return instructions provided' },
        { label: 'Receipt', description: 'Returned goods received and counted' },
        { label: 'Inspection', description: 'Determine suitability for restock or rework' },
        { label: 'Disposition', description: 'Restock, rework, or scrap decision' },
        { label: 'Credit', description: 'Credit memo issued and GL entries posted' }
      ]}
      moduleMappings={[
        {
          module: 'Sales',
          forms: ['Return Authorization', 'RMA', 'Return Reason', 'Return Policy'],
          impact: 'Return authorization and tracking'
        },
        {
          module: 'Warehouse',
          forms: ['Return Receipt', 'Return Inspection', 'Return Location', 'Return Hold'],
          impact: 'Return goods handling'
        },
        {
          module: 'Quality',
          forms: ['Inspection Report', 'Defect Finding', 'Return Disposition'],
          impact: 'Return quality assessment'
        },
        {
          module: 'Finance',
          forms: ['Credit Memo', 'Revenue Reversal', 'Return Cost', 'RMA GL Entry'],
          impact: 'Return accounting and GL posting'
        }
      ]}
      keyBenefits={[
        'RMA cycle time of 1.2 hours',
        'Return rate reduced to 1.2%',
        'Approval rate of 94%+',
        'Return processing time of 4.5 days',
        'Defect find rate of 12%',
        'Credit processing accuracy of 99.8%'
      ]}
      glAccounts={['GL-1400', 'GL-1200', 'GL-4000', 'GL-5100', 'GL-5150']}
    />
  );
}
