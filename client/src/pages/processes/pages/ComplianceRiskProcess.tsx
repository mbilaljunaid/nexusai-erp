import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export default function ComplianceRiskProcess() {
  const flowSteps = [
    { id: 1, label: 'Audit Trail', type: 'input' as const },
    { id: 2, label: 'Risk Assess', type: 'approval' as const },
    { id: 3, label: 'Exception Rpt', type: 'input' as const },
    { id: 4, label: 'Investigation', type: 'approval' as const },
    { id: 5, label: 'Corrective Act', type: 'posting' as const },
    { id: 6, label: 'Close', type: 'completion' as const }
  ];

  const forms = [
    { id: 'audit', name: 'Audit Trail Log', sequence: 1, required: true, glAccounts: [] },
    { id: 'risk', name: 'Risk Assessment', sequence: 2, required: true, glAccounts: [] },
    { id: 'exc', name: 'Exception Report', sequence: 3, required: true, glAccounts: [] },
    { id: 'inv', name: 'Investigation', sequence: 4, required: true, glAccounts: [] },
    { id: 'cap', name: 'Corrective Action', sequence: 5, required: true, glAccounts: [] },
    { id: 'close', name: 'Closure Report', sequence: 6, required: true, glAccounts: [] }
  ];

  const glAccounts = [
    { account: 'GL-1000-9999', description: 'All GL Accounts (Audit scope)', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-9100', description: 'Compliance Reserve', type: 'liability', debitCredit: 'Cr' as const },
    { account: 'GL-6900', description: 'Compliance Costs', type: 'expense', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'Audit Trail Coverage', value: '100%', target: '100%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Exceptions Found', value: '3', target: '<10', status: 'good' as const, trend: 'down' as const },
    { label: 'Investigation Time', value: '2 days', target: '<3 days', status: 'good' as const, trend: 'stable' as const },
    { label: 'Corrective Close %', value: '100%', target: '100%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Audit Readiness', value: 'Ready', target: 'Ready', status: 'good' as const, trend: 'stable' as const },
    { label: 'Compliance Risk', value: 'Low', target: 'Low', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="compliance-risk"
      processName="Compliance & Risk"
      processCode="P005"
      description="Enterprise-wide compliance monitoring and risk management. Includes audit trail review, risk assessment, exception reporting, investigation, and corrective action tracking."
      category="Governance"
      criticality="CRITICAL"
      cycleTime="Monthly"
      formsCount={5}
      glAccountsCount={3}
      approvalSteps={3}
      relatedProcesses={['Month-End Consolidation', 'Audit Committee', 'Internal Control']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The Compliance & Risk process provides comprehensive governance oversight across all ERP operations. The audit trail 
              captures every transaction, user action, and system change. Risk assessments identify control weaknesses, exceptions 
              trigger investigations, and corrective actions remediate issues.
            </p>
            <p>
              This process ensures regulatory compliance, detects fraud, maintains segregation of duties, and provides audit trail 
              documentation for external auditors. Regular monitoring and exception reporting enable proactive risk management.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Audit Trail Retention</div>
            <div className="text-lg font-semibold text-foreground mt-2">7 years minimum</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Approval Authority</div>
            <div className="text-lg font-semibold text-foreground mt-2">Audit Committee, CRO</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Compliance & Risk Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Audit Trail - Capture all transactions, user access, system changes in immutable log.</p>
            <p><strong>Step 2:</strong> Risk Assessment - Evaluate control environment, identify risk areas, prioritize monitoring.</p>
            <p><strong>Step 3:</strong> Exception Reporting - Monitor for anomalies, unusual transactions, policy violations.</p>
            <p><strong>Step 4:</strong> Investigation - Deep-dive analysis of exceptions, root cause determination.</p>
            <p><strong>Step 5:</strong> Corrective Actions - Implement fixes, strengthen controls, update policies.</p>
            <p><strong>Step 6:</strong> Closure & Reporting - Verify corrective actions effective, close investigation, external reporting.</p>
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
