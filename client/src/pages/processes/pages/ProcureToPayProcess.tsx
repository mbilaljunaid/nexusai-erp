import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export default function ProcureToPayProcess() {
  const flowSteps = [
    { id: 1, label: 'Requisition', type: 'input' as const },
    { id: 2, label: 'PO Approval', type: 'approval' as const },
    { id: 3, label: 'GR Receipt', type: 'input' as const },
    { id: 4, label: 'Invoice Match', type: 'approval' as const },
    { id: 5, label: 'GL Posting', type: 'posting' as const },
    { id: 6, label: 'Payment', type: 'completion' as const }
  ];

  const forms = [
    { id: 'req', name: 'Requisition Form', sequence: 1, required: true, glAccounts: ['GL-5000'] },
    { id: 'po', name: 'Purchase Order', sequence: 2, required: true, glAccounts: ['GL-5000'] },
    { id: 'gr', name: 'Goods Receipt', sequence: 3, required: true, glAccounts: ['GL-2100'] },
    { id: 'inv', name: 'Invoice Receipt', sequence: 4, required: true, glAccounts: ['GL-2100'] },
    { id: 'pay', name: 'Payment', sequence: 5, required: true, glAccounts: ['GL-1000'] },
    { id: 'gl', name: 'GL Posting', sequence: 6, required: true, glAccounts: ['GL-5000', 'GL-2100', 'GL-1000'] }
  ];

  const glAccounts = [
    { account: 'GL-5000', description: 'Purchases', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-2100', description: 'Accounts Payable', type: 'liability', debitCredit: 'Cr' as const },
    { account: 'GL-1000', description: 'Cash', type: 'asset', debitCredit: 'Cr' as const },
    { account: 'GL-1200', description: 'Inventory', type: 'asset', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'PO-to-Invoice Cycle', value: '15 days', target: '10 days', status: 'warning' as const, trend: 'stable' as const },
    { label: 'On-Time Rate', value: '94%', target: '95%', status: 'warning' as const, trend: 'down' as const },
    { label: 'Error Rate', value: '0.2%', target: '<0.5%', status: 'good' as const, trend: 'stable' as const },
    { label: '3-Way Matches', value: '98%', target: '99%', status: 'good' as const, trend: 'up' as const },
    { label: 'Approvals Pending', value: '2', target: '<5', status: 'good' as const, trend: 'stable' as const },
    { label: 'GL Reconciled %', value: '100%', target: '100%', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="procure-to-pay"
      processName="Procure to Pay"
      processCode="P001"
      description="Complete procurement cycle from purchase requisition through payment. Includes vendor selection, purchase order creation, goods receipt, invoice matching, and payment processing."
      category="Supply Chain"
      criticality="CRITICAL"
      cycleTime="15 days"
      formsCount={8}
      glAccountsCount={4}
      approvalSteps={3}
      relatedProcesses={['Order-to-Cash', 'Month-End Consolidation', 'GL Reconciliation']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The Procure-to-Pay process encompasses the complete purchasing lifecycle. Starting from internal purchase requisitions, 
              it flows through purchase order creation and approval, goods receipt and inspection, invoice validation, and final payment processing.
            </p>
            <p>
              Key controls include 3-way matching (PO, GR, Invoice), budget authority validation, quality inspection at receipt, 
              and GL posting at each transaction stage. The process integrates with the GL system for real-time expense tracking 
              and with the inventory system for stock availability.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Primary GL Accounts</div>
            <div className="text-lg font-semibold text-foreground mt-2">GL-5000, GL-2100, GL-1000</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Approval Authority</div>
            <div className="text-lg font-semibold text-foreground mt-2">Manager → Director → CFO</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Procure-to-Pay Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 1: Requisition Creation</h4>
              <p className="text-sm text-muted-foreground">Department submits purchase requisition with business justification and budget coding.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 2: Purchase Order Approval</h4>
              <p className="text-sm text-muted-foreground">PO created from approved requisition, routed for manager/director approval.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 3: Goods Receipt</h4>
              <p className="text-sm text-muted-foreground">Warehouse receives goods, inspects against PO, records receipt.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 4: Invoice Matching</h4>
              <p className="text-sm text-muted-foreground">3-way match validation: PO quantity/price vs GR vs Invoice.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 5: GL Posting</h4>
              <p className="text-sm text-muted-foreground">GL entries created: debit expense/inventory, credit payable.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 6: Payment Processing</h4>
              <p className="text-sm text-muted-foreground">Payment scheduled per terms, GL entries reduce AP and cash.</p>
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
