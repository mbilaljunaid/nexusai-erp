import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export function CustomerReturnsProcess() {
  const flowSteps = [
    { id: 1, label: 'Request', type: 'input' as const },
    { id: 2, label: 'Approval', type: 'approval' as const },
    { id: 3, label: 'Receipt', type: 'input' as const },
    { id: 4, label: 'Inspection', type: 'posting' as const },
    { id: 5, label: 'Disposition', type: 'posting' as const },
    { id: 6, label: 'Credit', type: 'completion' as const }
  ];

  const forms = [
    { id: 'rma', name: 'Return Authorization', sequence: 1, required: true, glAccounts: [] },
    { id: 'app', name: 'Approval', sequence: 2, required: true, glAccounts: [] },
    { id: 'rec', name: 'Return Receipt', sequence: 3, required: true, glAccounts: ['GL-1400'] },
    { id: 'insp', name: 'Return Inspection', sequence: 4, required: true, glAccounts: ['GL-5150'] },
    { id: 'disp', name: 'Disposition Decision', sequence: 5, required: true, glAccounts: ['GL-1200', 'GL-5100', 'GL-4000'] },
    { id: 'cred', name: 'Credit Memo', sequence: 6, required: true, glAccounts: ['GL-4000'] }
  ];

  const glAccounts = [
    { account: 'GL-1400', description: 'Finished Goods', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-1200', description: 'Raw Materials', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-4000', description: 'Revenue', type: 'revenue', debitCredit: 'Cr' as const },
    { account: 'GL-5100', description: 'Scrap/Rework', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-5150', description: 'Quality Control', type: 'expense', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'Return Authorization Time', value: '1.2 hours', target: '<2 hours', status: 'good' as const, trend: 'stable' as const },
    { label: 'Return Rate', value: '1.2%', target: '<2%', status: 'good' as const, trend: 'down' as const },
    { label: 'Approval Rate', value: '94%', target: '>90%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Return Processing Days', value: '4.5 days', target: '<7 days', status: 'good' as const, trend: 'stable' as const },
    { label: 'Inspection Defect Find', value: '12%', target: '<15%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Credit Processing Accuracy', value: '99.8%', target: '>99%', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="customer-returns"
      processName="Customer Returns & RMA"
      processCode="P016"
      description="Complete returns management including return authorization, goods receipt inspection, disposition determination (restock, rework, scrap), and credit memo issuance with inventory adjustments."
      category="Sales & Service"
      criticality="HIGH"
      cycleTime="7 days"
      formsCount={6}
      glAccountsCount={5}
      approvalSteps={2}
      relatedProcesses={['Order-to-Cash', 'Quality Assurance', 'Inventory Management']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The Customer Returns process manages product returns from customers. A Return Authorization (RMA) is issued to control the return stream. Returned goods are received, physically inspected for condition, and assigned a disposition: restock to inventory, send for rework, or scrap. A credit memo is issued to the customer. GL entries reverse the original sale and record the disposition cost.
            </p>
            <p>
              Returns insights highlight product quality issues driving improvements. Return rates and costs are tracked for customer profitability analysis. Proper classification of returns (warranty, defect, customer change of mind) informs product and customer strategies.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Return Window</div>
            <div className="text-lg font-semibold text-foreground mt-2">30 days from delivery</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Disposition Options</div>
            <div className="text-lg font-semibold text-foreground mt-2">Restock, Rework, Scrap</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Customer Returns & RMA Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Customer initiates return request with reason code.</p>
            <p><strong>Step 2:</strong> Return Authorization approved, RMA number issued, return instructions provided.</p>
            <p><strong>Step 3:</strong> Returned goods received, counted, and initial condition assessed.</p>
            <p><strong>Step 4:</strong> Quality inspection determines suitability for restock or rework.</p>
            <p><strong>Step 5:</strong> Disposition assigned: restock inventory, send for rework, or scrap.</p>
            <p><strong>Step 6:</strong> Credit memo issued, GL entries reverse sale, inventory adjusted.</p>
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
