import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export default function PublicVendorPerformanceProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Vendor Performance Management"
      processCode="P017"
      criticality="HIGH"
      category="Procurement"
      cycletime="Quarterly"
      description="Systematic supplier evaluation using scorecards and performance insights"
      flowSteps={[
        { label: 'Scorecard', description: 'Design scorecard with weighted metrics' },
        { label: 'Metrics', description: 'Collect performance data from PO and quality records' },
        { label: 'Evaluation', description: 'Calculate weighted score and rating' },
        { label: 'Review', description: 'Performance discussion meeting with vendor' },
        { label: 'Action', description: 'Action plan for underperforming vendors' },
        { label: 'Improvement', description: 'Track improvement progress quarterly' }
      ]}
      moduleMappings={[
        {
          module: 'Procurement',
          forms: ['Vendor Master', 'Vendor Scorecard', 'Performance Metrics', 'Vendor Rating'],
          impact: 'Vendor management and evaluation'
        },
        {
          module: 'Quality',
          forms: ['Quality Score', 'Defect Rate', 'Incoming QC', 'Rejection Rate'],
          impact: 'Quality performance metrics'
        },
        {
          module: 'Operations',
          forms: ['Delivery Performance', 'On-Time Delivery', 'Delivery Variance', 'Lead Time'],
          impact: 'Delivery and logistics performance'
        },
        {
          module: 'Finance',
          forms: ['Price Competitiveness', 'Cost Analysis', 'Discount Compliance', 'Payment Terms'],
          impact: 'Pricing and financial performance'
        }
      ]}
      keyBenefits={[
        'On-time delivery maintained at 96.2%',
        'Quality defect rate at 0.4%',
        'Price competitiveness at 89%',
        'Supplier responsiveness at 92%',
        'Overall vendor score of 93.8%',
        'Active vendors: 87 in network'
      ]}
      glAccounts={['GL-5000']}
    />
  );
}
