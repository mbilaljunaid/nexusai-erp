import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export function ContractManagementProcess() {
  const flowSteps = [
    { id: 1, label: 'Requirement', type: 'input' as const },
    { id: 2, label: 'Draft', type: 'input' as const },
    { id: 3, label: 'Review', type: 'approval' as const },
    { id: 4, label: 'Execution', type: 'posting' as const },
    { id: 5, label: 'Management', type: 'posting' as const },
    { id: 6, label: 'Renewal', type: 'completion' as const }
  ];

  const forms = [
    { id: 'req', name: 'Contract Requirement', sequence: 1, required: true, glAccounts: [] },
    { id: 'draft', name: 'Contract Draft', sequence: 2, required: true, glAccounts: [] },
    { id: 'rev', name: 'Contract Review', sequence: 3, required: true, glAccounts: [] },
    { id: 'exec', name: 'Contract Execution', sequence: 4, required: true, glAccounts: ['GL-2500'] },
    { id: 'mgmt', name: 'Contract Maintenance', sequence: 5, required: true, glAccounts: ['GL-2500'] },
    { id: 'renew', name: 'Renewal/Termination', sequence: 6, required: false, glAccounts: ['GL-2500'] }
  ];

  const glAccounts = [
    { account: 'GL-2500', description: 'Deferred Revenue / Prepayment', type: 'liability', debitCredit: 'Cr' as const },
    { account: 'GL-4100', description: 'Contract Revenue', type: 'revenue', debitCredit: 'Cr' as const }
  ];

  const metrics = [
    { label: 'Contract Cycle Time', value: '18 days', target: '<20 days', status: 'good' as const, trend: 'down' as const },
    { label: 'On-Time Renewals', value: '99%', target: '100%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Contract Disputes', value: '1', target: '0', status: 'warning' as const, trend: 'stable' as const },
    { label: 'Revenue Recognition Accuracy', value: '100%', target: '100%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Amendment Response Time', value: '2.1 days', target: '<3 days', status: 'good' as const, trend: 'stable' as const },
    { label: 'Compliance Status', value: '100%', target: '100%', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="contract-management"
      processName="Contract Management"
      processCode="P011"
      description="End-to-end contract lifecycle management including requirements gathering, drafting, legal review, execution, ongoing management, and renewal/termination with revenue recognition controls."
      category="Finance"
      criticality="HIGH"
      cycleTime="18-30 days"
      formsCount={6}
      glAccountsCount={2}
      approvalSteps={3}
      relatedProcesses={['Order-to-Cash', 'Procure-to-Pay', 'Month-End Consolidation']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Contract Management ensures all organizational commitments are properly documented, legally reviewed, and executed. The process covers requirements gathering, contract drafting against templates, multi-level review and approval, execution and signature, ongoing compliance monitoring, and timely renewal or termination.
            </p>
            <p>
              Key GL impacts include revenue recognition timing, deferred revenue accounting for prepayments, and expense recognition for purchase commitments. Contract terms drive invoice timing, payment terms, and penalty clauses.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Key Controls</div>
            <div className="text-lg font-semibold text-foreground mt-2">Legal Review, Approval Matrix</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Revenue Accounting</div>
            <div className="text-lg font-semibold text-foreground mt-2">ASC 606 Compliance</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Contract Management Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Business requirement identified with key terms and conditions.</p>
            <p><strong>Step 2:</strong> Contract drafted using approved templates with standard terms.</p>
            <p><strong>Step 3:</strong> Legal, Finance, and Exec review for compliance and risk assessment.</p>
            <p><strong>Step 4:</strong> Execution with authorized signatures and counterparty execution.</p>
            <p><strong>Step 5:</strong> Ongoing management including performance monitoring and amendments.</p>
            <p><strong>Step 6:</strong> Renewal negotiation or termination per contract terms.</p>
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
