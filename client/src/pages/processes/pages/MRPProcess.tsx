import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export default function MRPProcess() {
  const flowSteps = [
    { id: 1, label: 'MPS', type: 'input' as const },
    { id: 2, label: 'BOM Explosion', type: 'input' as const },
    { id: 3, label: 'Inventory Check', type: 'approval' as const },
    { id: 4, label: 'Lead Time', type: 'input' as const },
    { id: 5, label: 'Planned Orders', type: 'posting' as const },
    { id: 6, label: 'Release', type: 'completion' as const }
  ];

  const forms = [
    { id: 'mps', name: 'Master Production Schedule', sequence: 1, required: true, glAccounts: [] },
    { id: 'bom', name: 'Bill of Materials', sequence: 2, required: true, glAccounts: [] },
    { id: 'inv', name: 'Available Inventory', sequence: 3, required: true, glAccounts: ['GL-1200'] },
    { id: 'lt', name: 'Lead Time Offset', sequence: 4, required: true, glAccounts: [] },
    { id: 'ppo', name: 'Planned Purchase Order', sequence: 5, required: true, glAccounts: ['GL-5000'] },
    { id: 'pwo', name: 'Planned Work Order', sequence: 6, required: false, glAccounts: [] }
  ];

  const glAccounts = [
    { account: 'GL-1200', description: 'Inventory', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-5000', description: 'Purchases', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-6500', description: 'Carrying Cost', type: 'expense', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'Forecast Accuracy', value: '91%', target: '90%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Stockout Rate', value: '0.8%', target: '<1%', status: 'good' as const, trend: 'down' as const },
    { label: 'Safety Stock Level', value: '14 days', target: '14 days', status: 'good' as const, trend: 'stable' as const },
    { label: 'Order Point Accuracy', value: '96%', target: '>95%', status: 'good' as const, trend: 'up' as const },
    { label: 'Carrying Cost %', value: '2.3%', target: '<2.5%', status: 'good' as const, trend: 'stable' as const },
    { label: 'EOQ Compliance', value: '94%', target: '>90%', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="mrp"
      processName="Material Requirements Planning"
      processCode="P009"
      description="Automated determination of material needs based on production schedule. MRP explozes the bill of materials, checks available inventory, applies lead time offsets, and generates planned purchase and production orders."
      category="Manufacturing"
      criticality="HIGH"
      cycleTime="Weekly"
      formsCount={6}
      glAccountsCount={3}
      approvalSteps={1}
      relatedProcesses={['Production Planning', 'Procure-to-Pay', 'Inventory Management', 'Demand Planning']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Material Requirements Planning (MRP) is the engine that drives procurement and production. Starting with the Master Production Schedule, MRP explodes the bill of materials to determine gross component requirements. Available inventory is netted against requirements. Lead times are applied to schedule material arrivals. Safety stock buffers account for demand and lead time variability. The result is a complete schedule of planned purchase orders and work orders that ensures material availability exactly when needed.
            </p>
            <p>
              MRP minimizes inventory carrying costs while preventing stockouts and production delays. Periodic regenerative runs recalculate requirements based on updated demand and adjust order quantities using economic order quantity (EOQ) optimization.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Run Frequency</div>
            <div className="text-lg font-semibold text-foreground mt-2">Weekly (or Daily)</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Planning Horizon</div>
            <div className="text-lg font-semibold text-foreground mt-2">12-18 months forward</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Material Requirements Planning Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> MPS Input - Master Production Schedule defines what to make, when.</p>
            <p><strong>Step 2:</strong> BOM Explosion - For each product: multiply MPS qty × BOM component qty.</p>
            <p><strong>Step 3:</strong> Inventory Netting - Gross requirements minus on-hand and on-order inventory.</p>
            <p><strong>Step 4:</strong> Lead Time Offset - Schedule material to arrive when needed (required date - lead time).</p>
            <p><strong>Step 5:</strong> Planned Orders - Generate purchase requisitions and work order suggestions.</p>
            <p><strong>Step 6:</strong> Order Release - Approve and release planned orders into active procurement/production.</p>
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
