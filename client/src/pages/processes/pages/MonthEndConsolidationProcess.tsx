import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export default function MonthEndConsolidationProcess() {
  const flowSteps = [
    { id: 1, label: 'GL Close', type: 'input' as const },
    { id: 2, label: 'Reconcile', type: 'approval' as const },
    { id: 3, label: 'Eliminate IC', type: 'input' as const },
    { id: 4, label: 'Accruals', type: 'input' as const },
    { id: 5, label: 'Consolidate', type: 'posting' as const },
    { id: 6, label: 'Reports', type: 'completion' as const }
  ];

  const forms = [
    { id: 'close', name: 'GL Close Checklist', sequence: 1, required: true, glAccounts: ['GL-1000-9999'] },
    { id: 'recon', name: 'GL Reconciliation', sequence: 2, required: true, glAccounts: ['GL-1000-9999'] },
    { id: 'ic', name: 'IC Elimination', sequence: 3, required: false, glAccounts: ['GL-1000-9999'] },
    { id: 'accrual', name: 'Accrual Entry', sequence: 4, required: true, glAccounts: ['GL-2500', 'GL-6000'] },
    { id: 'consol', name: 'Consolidation', sequence: 5, required: true, glAccounts: ['GL-1000-9999'] },
    { id: 'report', name: 'Financial Statements', sequence: 6, required: true, glAccounts: ['GL-1000-9999'] }
  ];

  const glAccounts = [
    { account: 'GL-1000', description: 'Cash & Equivalents', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-1100', description: 'Accounts Receivable', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-1200', description: 'Inventory', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-1500', description: 'Fixed Assets', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-2100', description: 'Accounts Payable', type: 'liability', debitCredit: 'Cr' as const },
    { account: 'GL-2500', description: 'Accrued Liabilities', type: 'liability', debitCredit: 'Cr' as const },
    { account: 'GL-3000', description: 'Equity', type: 'equity', debitCredit: 'Cr' as const },
    { account: 'GL-4000', description: 'Revenue', type: 'revenue', debitCredit: 'Cr' as const }
  ];

  const metrics = [
    { label: 'Close Timeline', value: '5 days', target: '<5 days', status: 'good' as const, trend: 'stable' as const },
    { label: 'Reconciliation %', value: '100%', target: '100%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Variance Found', value: '0', target: '0', status: 'good' as const, trend: 'stable' as const },
    { label: 'Accruals Accuracy', value: '100%', target: '100%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Journal Entries', value: '124', target: 'Tracked', status: 'good' as const, trend: 'stable' as const },
    { label: 'Audit Ready', value: 'Yes', target: 'Yes', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="month-end-consolidation"
      processName="Month-End Consolidation"
      processCode="P004"
      description="Complete month-end financial close including GL reconciliation, intercompany elimination, accrual entries, and consolidated financial statement generation."
      category="Finance"
      criticality="CRITICAL"
      cycleTime="5 days"
      formsCount={6}
      glAccountsCount={8}
      approvalSteps={2}
      relatedProcesses={['Procure-to-Pay', 'Order-to-Cash', 'Budget Planning']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The Month-End Consolidation process represents the financial close cycle. All GL postings from operational processes 
              flow through GL reconciliation to ensure proper posting. Intercompany transactions are eliminated, accruals recorded, 
              and consolidated financial statements generated for management reporting and external compliance.
            </p>
            <p>
              This critical process ensures financial integrity and audit readiness. Key controls include GL-to-bank reconciliation, 
              sub-ledger reconciliation, variance investigation, and sign-off by Finance Controller before release to external stakeholders.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Frequency</div>
            <div className="text-lg font-semibold text-foreground mt-2">Monthly (within 5 days)</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Approval Authority</div>
            <div className="text-lg font-semibold text-foreground mt-2">CFO, Audit Committee</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Month-End Close Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> GL Close Checklist - Verify all transactions posted, cutoff entries complete.</p>
            <p><strong>Step 2:</strong> GL Reconciliation - Bank reconciliation, sub-ledger reconciliation, variance investigation.</p>
            <p><strong>Step 3:</strong> IC Elimination - Remove intercompany transactions for consolidated view.</p>
            <p><strong>Step 4:</strong> Accrual Entries - Record month-end accruals (unbilled revenue, expenses, etc).</p>
            <p><strong>Step 5:</strong> Consolidation - Combine all entities into consolidated trial balance.</p>
            <p><strong>Step 6:</strong> Financial Reports - Generate balance sheet, P&L, cash flow statements.</p>
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
