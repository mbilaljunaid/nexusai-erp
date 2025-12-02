import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export default function PublicHireToRetireProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Hire-to-Retire"
      processCode="P003"
      criticality="CRITICAL"
      category="HR"
      cycletime="30 days"
      description="Complete employee lifecycle from job opening and recruitment through retirement and exit"
      flowSteps={[
        { label: 'Job Opening', description: 'HR creates job requisition with headcount budget approval' },
        { label: 'Recruitment', description: 'Job posting, resume screening, and interview process' },
        { label: 'Offer', description: 'Job offer extended with compensation package' },
        { label: 'Onboarding', description: 'New employee setup, system access, and training' },
        { label: 'Employment', description: 'Active employment with payroll processing' },
        { label: 'Termination', description: 'Exit process and final payment' }
      ]}
      moduleMappings={[
        {
          module: 'HR',
          forms: ['Job Requisition', 'Job Posting', 'Applicant Tracking', 'Candidate'],
          impact: 'Recruitment and hiring process management'
        },
        {
          module: 'Payroll',
          forms: ['Employee Master', 'Attendance', 'Timesheet', 'Salary', 'Deductions'],
          impact: 'Employee data and compensation tracking'
        },
        {
          module: 'Benefits',
          forms: ['Health Insurance', 'Retirement Plan', 'Benefit Elections', '401k'],
          impact: 'Employee benefits administration'
        },
        {
          module: 'Finance',
          forms: ['Payroll Register', 'Payroll Expense', 'Tax Filing', 'Retirement Accrual'],
          impact: 'Labor cost accounting and tax compliance'
        }
      ]}
      keyBenefits={[
        'Reduced hiring cycle time from 60 days to 30 days',
        'Improved employee retention through better onboarding',
        'Automated payroll with 99.9% accuracy',
        'Complete compliance with labor regulations',
        'Real-time labor cost analysis and forecasting',
        'Improved employee experience and engagement'
      ]}
      glAccounts={['GL-6100', 'GL-6300', 'GL-2300', 'GL-1000']}
    />
  );
}
