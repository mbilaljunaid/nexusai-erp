import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export function PublicQualityProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Quality Assurance & Control"
      processCode="P010"
      criticality="CRITICAL"
      category="Manufacturing"
      cycletime="Ongoing"
      description="Quality management system covering incoming inspection, process control, and corrective actions"
      flowSteps={[
        { label: 'Incoming QC', description: 'Inspect received materials against acceptance criteria' },
        { label: 'Inspection', description: 'Record measurements and test results' },
        { label: 'Disposition', description: 'Accept, reject, or hold for rework' },
        { label: 'Process Control', description: 'Monitor production with control charts' },
        { label: 'NCR', description: 'Document non-conformance with root cause' },
        { label: 'CAP', description: 'Implement corrective action and prevent recurrence' }
      ]}
      moduleMappings={[
        {
          module: 'Quality',
          forms: ['Incoming QC', 'Inspection Record', 'Test Result', 'QC Hold'],
          impact: 'Quality inspection and acceptance'
        },
        {
          module: 'Manufacturing',
          forms: ['Process Control Chart', 'SPC Monitor', 'Control Limit', 'Out-of-Control Alert'],
          impact: 'Statistical process control'
        },
        {
          module: 'Compliance',
          forms: ['NCR', 'Root Cause Analysis', 'Corrective Action Plan', 'Effectiveness Review'],
          impact: 'Non-conformance and corrective actions'
        },
        {
          module: 'Finance',
          forms: ['Quality Cost', 'Scrap Cost', 'Rework Cost', 'QC Expense'],
          impact: 'Quality cost tracking'
        }
      ]}
      keyBenefits={[
        'Inspection pass rate of 96.5%+',
        'Incoming defect rate reduced to 0.3%',
        'Process capability (Cpk) improved to 1.45',
        'NCR resolution time of 4.2 days',
        'Scrap rate reduced to 0.8%',
        'On-time QC at 98%'
      ]}
      glAccounts={['GL-1200', 'GL-5100', 'GL-5150']}
    />
  );
}
