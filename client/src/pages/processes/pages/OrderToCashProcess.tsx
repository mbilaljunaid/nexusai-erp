import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export function OrderToCashProcess() {
  const flowSteps = [
    { id: 1, label: 'Lead Creation', type: 'input' as const },
    { id: 2, label: 'Sales Order', type: 'approval' as const },
    { id: 3, label: 'Fulfillment', type: 'input' as const },
    { id: 4, label: 'Shipment', type: 'input' as const },
    { id: 5, label: 'Invoice', type: 'posting' as const },
    { id: 6, label: 'Payment', type: 'completion' as const }
  ];

  const forms = [
    { id: 'lead', name: 'Lead Form', sequence: 1, required: false, glAccounts: [] },
    { id: 'so', name: 'Sales Order', sequence: 2, required: true, glAccounts: ['GL-4000'] },
    { id: 'ship', name: 'Shipment', sequence: 3, required: true, glAccounts: ['GL-5100', 'GL-1200'] },
    { id: 'inv', name: 'Invoice', sequence: 4, required: true, glAccounts: ['GL-4000', 'GL-1100'] },
    { id: 'pay', name: 'Payment', sequence: 5, required: true, glAccounts: ['GL-1000', 'GL-1100'] },
    { id: 'rma', name: 'Return Auth.', sequence: 6, required: false, glAccounts: ['GL-4000', 'GL-1100'] }
  ];

  const glAccounts = [
    { account: 'GL-4000', description: 'Sales Revenue', type: 'revenue', debitCredit: 'Cr' as const },
    { account: 'GL-1100', description: 'Accounts Receivable', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-5100', description: 'Cost of Goods Sold', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-1000', description: 'Cash', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-1200', description: 'Inventory', type: 'asset', debitCredit: 'Cr' as const }
  ];

  const metrics = [
    { label: 'Quote-to-Cash', value: '30 days', target: '20 days', status: 'warning' as const, trend: 'down' as const },
    { label: 'On-Time Delivery', value: '96%', target: '98%', status: 'good' as const, trend: 'up' as const },
    { label: 'Invoice Accuracy', value: '99.8%', target: '99.9%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Payment on Time', value: '91%', target: '95%', status: 'warning' as const, trend: 'stable' as const },
    { label: 'AR Days', value: '28 days', target: '<30 days', status: 'good' as const, trend: 'stable' as const },
    { label: 'Gross Margin', value: '42%', target: '40%', status: 'good' as const, trend: 'up' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="order-to-cash"
      processName="Order to Cash"
      processCode="P002"
      description="Complete sales cycle from lead identification through cash collection. Includes opportunity qualification, sales order creation, fulfillment, shipment, invoicing, and payment receipt."
      category="Sales"
      criticality="CRITICAL"
      cycleTime="30 days"
      formsCount={8}
      glAccountsCount={5}
      approvalSteps={2}
      relatedProcesses={['Procure-to-Pay', 'Inventory Management', 'Month-End Consolidation']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The Order-to-Cash process represents the complete revenue cycle from initial customer contact through final payment collection. 
              It begins with lead qualification and flows through sales order creation, product fulfillment from inventory, shipment tracking, 
              invoice generation, and payment processing.
            </p>
            <p>
              Revenue is recognized at shipment when goods transfer to customer. The process includes AR aging management, payment application, 
              and GL reconciliation. Key metrics include quote-to-cash cycle time, on-time delivery, and days sales outstanding (DSO).
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Revenue Recognition</div>
            <div className="text-lg font-semibold text-foreground mt-2">At Shipment (GL-4000)</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Customer Credit Review</div>
            <div className="text-lg font-semibold text-foreground mt-2">Before Order Approval</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Order-to-Cash Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 1: Lead Creation</h4>
              <p className="text-sm text-muted-foreground">Sales identifies prospect, creates lead record with contact info and opportunity.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 2: Sales Order</h4>
              <p className="text-sm text-muted-foreground">Sales order created from qualified opportunity, customer credit approved, inventory reserved.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 3: Fulfillment</h4>
              <p className="text-sm text-muted-foreground">Warehouse picks items from inventory per sales order line items.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 4: Shipment</h4>
              <p className="text-sm text-muted-foreground">Items shipped to customer with tracking, GL recognizes revenue (GL-4000).</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 5: Invoice</h4>
              <p className="text-sm text-muted-foreground">Invoice generated post-shipment, AR recorded (GL-1100).</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step 6: Payment & Reconciliation</h4>
              <p className="text-sm text-muted-foreground">Payment received, applied to invoice, AR reconciled to sub-ledger.</p>
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
