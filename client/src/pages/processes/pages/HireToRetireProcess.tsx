import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export default function HireToRetireProcess() {
  const flowSteps = [
    { id: 1, label: 'Job Opening', type: 'input' as const },
    { id: 2, label: 'Applicant', type: 'input' as const },
    { id: 3, label: 'Offer', type: 'approval' as const },
    { id: 4, label: 'Onboard', type: 'input' as const },
    { id: 5, label: 'GL Posting', type: 'posting' as const },
    { id: 6, label: 'Separation', type: 'completion' as const }
  ];

  const forms = [
    { id: 'jo', name: 'Job Opening', sequence: 1, required: true, glAccounts: ['GL-6100'] },
    { id: 'app', name: 'Applicant', sequence: 2, required: true, glAccounts: [] },
    { id: 'offer', name: 'Offer Letter', sequence: 3, required: true, glAccounts: ['GL-6100'] },
    { id: 'emp', name: 'Employee', sequence: 4, required: true, glAccounts: ['GL-6100', 'GL-6300'] },
    { id: 'att', name: 'Attendance', sequence: 5, required: true, glAccounts: ['GL-6110'] },
    { id: 'payroll', name: 'Payroll', sequence: 6, required: true, glAccounts: ['GL-1000', 'GL-6100'] }
  ];

  const glAccounts = [
    { account: 'GL-6100', description: 'Salary Expense', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-6110', description: 'Direct Labor', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-6300', description: 'Benefits Expense', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-1000', description: 'Cash', type: 'asset', debitCredit: 'Cr' as const },
    { account: 'GL-2300', description: 'Accrued Payroll', type: 'liability', debitCredit: 'Cr' as const }
  ];

  const metrics = [
    { label: 'Offer-to-Start', value: '30 days', target: '30 days', status: 'good' as const, trend: 'stable' as const },
    { label: 'Attendance Rate', value: '96%', target: '97%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Payroll Accuracy', value: '100%', target: '100%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Turnover Rate', value: '12%', target: '<10%', status: 'warning' as const, trend: 'up' as const },
    { label: 'Performance Reviews', value: '94%', target: '100%', status: 'good' as const, trend: 'up' as const },
    { label: 'Training Hours', value: '32 hrs', target: '>24 hrs', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="hire-to-retire"
      processName="Hire to Retire"
      processCode="P003"
      description="Complete employee lifecycle from job requisition through retirement. Includes recruitment, hiring, onboarding, employment, performance management, and separation processing."
      category="HR"
      criticality="CRITICAL"
      cycleTime="30 days"
      formsCount={7}
      glAccountsCount={5}
      approvalSteps={3}
      relatedProcesses={['Budget Planning', 'Month-End Consolidation', 'Compliance & Risk']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The Hire-to-Retire process encompasses the complete employee lifecycle management. Starting from job opening creation 
              and recruitment, it flows through applicant screening, offer generation and acceptance, onboarding, active employment 
              with attendance and performance tracking, and finally separation/retirement processing.
            </p>
            <p>
              Key controls include salary budget authority, payroll accuracy validation, attendance tracking for labor allocation, 
              and GL posting of all compensation expenses. The process integrates with budgeting for headcount planning and GL systems 
              for real-time labor cost tracking.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Primary GL Impact</div>
            <div className="text-lg font-semibold text-foreground mt-2">GL-6100 (Salary), GL-6300 (Benefits)</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Budget Control</div>
            <div className="text-lg font-semibold text-foreground mt-2">Department Manager & Finance</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Hire-to-Retire Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 1: Job Opening</h4>
              <p className="text-sm text-muted-foreground">Department manager submits job opening request with position details, salary range, and budget code.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 2: Applicant Screening</h4>
              <p className="text-sm text-muted-foreground">HR screens applicants, conducts interviews, narrows to final candidates.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 3: Offer Generation</h4>
              <p className="text-sm text-muted-foreground">HR generates offer letter with salary, benefits, start date. Requires manager approval.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 4: Onboarding</h4>
              <p className="text-sm text-muted-foreground">New hire processes paperwork, benefits enrollment, system access setup.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 5: Employment</h4>
              <p className="text-sm text-muted-foreground">Daily attendance tracking, performance reviews, salary adjustments, GL posting.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 6: Separation</h4>
              <p className="text-sm text-muted-foreground">Exit processing, final paycheck, benefits cessation, GL removal from active payroll.</p>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="forms" className="space-y-6">
        <FormsList forms={forms} />
      </TabsContent>

      <TabsContent value="gl-mapping" className="space-y-6">
        <GLMappingPanel accounts={glAccounts} />
      </TabsContent>

      <TabsContent value="metrics" className="space-y-6">
        <KPIMetrics metrics={metrics} layout="grid" />
      </TabsContent>
    </ProcessPageTemplate>
  );
}
