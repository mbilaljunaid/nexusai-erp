import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export function PublicComplianceProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Compliance & Risk Management"
      processCode="P005"
      criticality="CRITICAL"
      category="Governance"
      cycletime="Monthly"
      description="Complete compliance management from audit trail tracking through risk assessment and corrective actions"
      flowSteps={[
        { label: 'Audit Trail', description: 'Track all system changes with user, time, and details' },
        { label: 'Access Control', description: 'Manage user roles, permissions, and segregation of duties' },
        { label: 'Risk Assessment', description: 'Identify and document business risks and controls' },
        { label: 'Control Testing', description: 'Test control effectiveness and identify gaps' },
        { label: 'Findings', description: 'Document findings and create corrective actions' },
        { label: 'Remediation', description: 'Implement corrective actions and verify closure' }
      ]}
      moduleMappings={[
        {
          module: 'Admin',
          forms: ['User', 'Role', 'Permission', 'Access Policy'],
          impact: 'User management and access control'
        },
        {
          module: 'Governance',
          forms: ['Risk Register', 'Control', 'Testing', 'Finding'],
          impact: 'Risk assessment and control testing'
        },
        {
          module: 'Audit',
          forms: ['Audit Trail', 'Change Log', 'Exception Report', 'Audit Log'],
          impact: 'Transaction logging and audit trail'
        },
        {
          module: 'Compliance',
          forms: ['Compliance Checklist', 'Policy', 'Exception', 'Remediation Plan'],
          impact: 'Compliance tracking and reporting'
        }
      ]}
      keyBenefits={[
        'Complete audit trail with 100% transaction visibility',
        'Automated compliance monitoring and exception reporting',
        'Segregation of duties enforcement across all processes',
        'Reduced compliance risk and audit findings',
        'Real-time compliance status dashboards',
        'Enhanced internal control environment'
      ]}
      glAccounts={['GL-8000', 'GL-8100', 'GL-8200', 'GL-8300']}
    />
  );
}
