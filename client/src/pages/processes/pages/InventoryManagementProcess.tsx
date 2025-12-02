import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export function InventoryManagementProcess() {
  const flowSteps = [
    { id: 1, label: 'Item Master', type: 'input' as const },
    { id: 2, label: 'GR Receipt', type: 'approval' as const },
    { id: 3, label: 'Inspection', type: 'input' as const },
    { id: 4, label: 'Storage', type: 'input' as const },
    { id: 5, label: 'Issuance', type: 'posting' as const },
    { id: 6, label: 'Adjustment', type: 'completion' as const }
  ];

  const forms = [
    { id: 'item', name: 'Item Master', sequence: 1, required: true, glAccounts: ['GL-1200'] },
    { id: 'gr', name: 'Goods Receipt', sequence: 2, required: true, glAccounts: ['GL-1200'] },
    { id: 'insp', name: 'Inspection', sequence: 3, required: true, glAccounts: ['GL-5150'] },
    { id: 'stor', name: 'Storage Location', sequence: 4, required: true, glAccounts: ['GL-1200'] },
    { id: 'issue', name: 'Issuance', sequence: 5, required: true, glAccounts: ['GL-1200', 'GL-5100'] },
    { id: 'adj', name: 'Adjustment', sequence: 6, required: true, glAccounts: ['GL-1200', 'GL-5250'] }
  ];

  const glAccounts = [
    { account: 'GL-1200', description: 'Inventory Asset', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-1205', description: 'Obsolescence Reserve', type: 'asset', debitCredit: 'Cr' as const },
    { account: 'GL-5100', description: 'Cost of Goods Sold', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-5150', description: 'Scrap & Waste', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-5250', description: 'Inventory Variance', type: 'expense', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'Inventory Turnover', value: '8x/yr', target: '8x/yr', status: 'good' as const, trend: 'stable' as const },
    { label: 'Stockout %', value: '1.2%', target: '<2%', status: 'good' as const, trend: 'down' as const },
    { label: 'Shrinkage %', value: '0.3%', target: '<0.5%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Obsolete Items', value: '2.1%', target: '<3%', status: 'good' as const, trend: 'down' as const },
    { label: 'Carrying Cost', value: '$2.4M', target: '<$2.5M', status: 'good' as const, trend: 'stable' as const },
    { label: 'Accuracy %', value: '99.8%', target: '99.8%', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="inventory-management"
      processName="Inventory Management"
      processCode="P006"
      description="Complete inventory lifecycle from item master definition through receipt, storage, issuance, and periodic adjustment. Tracks stock levels, manages reorder points, and reconciles physical vs. system inventory."
      category="Operations"
      criticality="HIGH"
      cycleTime="Daily"
      formsCount={8}
      glAccountsCount={5}
      approvalSteps={2}
      relatedProcesses={['Procure-to-Pay', 'Order-to-Cash', 'MRP', 'Production Planning']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Inventory Management tracks all material flow through the organization. From item master setup through goods receipt, 
              inspection, warehouse storage, and issuance to production or sales. The process includes periodic physical counts, 
              variance investigation, and GL reconciliation.
            </p>
            <p>
              Key metrics include inventory turnover, shrinkage rate, stockout frequency, and obsolescence levels. The process 
              integrates with MRP for demand-driven replenishment and with the GL system for real-time inventory valuation.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Valuation Method</div>
            <div className="text-lg font-semibold text-foreground mt-2">FIFO / Weighted Avg</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Physical Count Cycle</div>
            <div className="text-lg font-semibold text-foreground mt-2">Monthly + Annual</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Inventory Management Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Item Master - Define SKU, unit cost, reorder point, storage location, GL mapping.</p>
            <p><strong>Step 2:</strong> Goods Receipt - Warehouse receives items against PO, records receipt quantity.</p>
            <p><strong>Step 3:</strong> QC Inspection - Quality checks received goods, accepts or rejects per spec.</p>
            <p><strong>Step 4:</strong> Storage - Place items in warehouse location, bin tracking for traceability.</p>
            <p><strong>Step 5:</strong> Issuance - Pick items for production or sales, update GL (COGS).</p>
            <p><strong>Step 6:</strong> Adjustment - Monthly cycle count, investigate variances, adjust GL for shrinkage.</p>
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
