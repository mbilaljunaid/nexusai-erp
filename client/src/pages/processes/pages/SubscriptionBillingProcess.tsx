import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export function SubscriptionBillingProcess() {
  const flowSteps = [
    { id: 1, label: 'Order', type: 'input' as const },
    { id: 2, label: 'Activation', type: 'approval' as const },
    { id: 3, label: 'Billing', type: 'posting' as const },
    { id: 4, label: 'Collection', type: 'posting' as const },
    { id: 5, label: 'Recognition', type: 'posting' as const },
    { id: 6, label: 'Renewal', type: 'completion' as const }
  ];

  const forms = [
    { id: 'order', name: 'Subscription Order', sequence: 1, required: true, glAccounts: ['GL-2500'] },
    { id: 'act', name: 'Service Activation', sequence: 2, required: true, glAccounts: [] },
    { id: 'bill', name: 'Invoice Generation', sequence: 3, required: true, glAccounts: ['GL-1100', 'GL-4100'] },
    { id: 'coll', name: 'Payment Collection', sequence: 4, required: true, glAccounts: ['GL-1000', 'GL-1100'] },
    { id: 'rec', name: 'Revenue Recognition', sequence: 5, required: true, glAccounts: ['GL-2500', 'GL-4100'] },
    { id: 'renew', name: 'Renewal / Cancellation', sequence: 6, required: false, glAccounts: ['GL-4100'] }
  ];

  const glAccounts = [
    { account: 'GL-1000', description: 'Cash', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-1100', description: 'Accounts Receivable', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-2500', description: 'Deferred Revenue', type: 'liability', debitCredit: 'Cr' as const },
    { account: 'GL-4100', description: 'Subscription Revenue', type: 'revenue', debitCredit: 'Cr' as const }
  ];

  const metrics = [
    { label: 'Monthly Recurring Revenue', value: '$2.4M', target: 'Growing', status: 'good' as const, trend: 'up' as const },
    { label: 'Churn Rate', value: '2.1%', target: '<3%', status: 'good' as const, trend: 'down' as const },
    { label: 'Customer Lifetime Value', value: '$8,400', target: '>$8K', status: 'good' as const, trend: 'up' as const },
    { label: 'Invoice Accuracy', value: '99.7%', target: '>99%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Payment Collection %', value: '98.2%', target: '>95%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Renewal Rate', value: '94.3%', target: '>90%', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="subscription-billing"
      processName="Subscription Billing"
      processCode="P018"
      description="Complete subscription management including order entry, service activation, periodic billing, payment collection, ASC 606 revenue recognition, and renewal/cancellation with deferred revenue accounting."
      category="Sales & Service"
      criticality="HIGH"
      cycleTime="Varies by plan"
      formsCount={6}
      glAccountsCount={4}
      approvalSteps={2}
      relatedProcesses={['Order-to-Cash', 'Contract Management', 'Month-End Consolidation']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Subscription Billing manages recurring revenue models including SaaS, managed services, and support contracts. Customers order recurring subscriptions with specific term lengths, service levels, and pricing. The system automatically activates services, generates periodic invoices, collects payments, and recognizes revenue monthly per ASC 606 standards.
            </p>
            <p>
              Key financial controls include deferred revenue accounting for upfront collections, revenue recognition for earned services, and churn analysis for customer retention. Renewal tracking ensures timely re-engagement before subscription expiration. Customer lifetime value calculations drive pricing and marketing decisions.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Revenue Standard</div>
            <div className="text-lg font-semibold text-foreground mt-2">ASC 606 - Monthly Recognition</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Typical Models</div>
            <div className="text-lg font-semibold text-foreground mt-2">Monthly, Annual Subscriptions</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Subscription Billing Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Customer subscribes to plan with term, price, and service level defined.</p>
            <p><strong>Step 2:</strong> Service activated immediately or on specified date, access provisioned.</p>
            <p><strong>Step 3:</strong> Invoice generated on schedule (monthly, annually), sent to customer.</p>
            <p><strong>Step 4:</strong> Payment collected via credit card, bank transfer, or invoice payment.</p>
            <p><strong>Step 5:</strong> Revenue recognized monthly as services are delivered per ASC 606.</p>
            <p><strong>Step 6:</strong> Renewal engagement drives next term purchase or cancellation.</p>
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
