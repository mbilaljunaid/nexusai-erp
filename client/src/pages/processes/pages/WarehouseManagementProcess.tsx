import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export function WarehouseManagementProcess() {
  const flowSteps = [
    { id: 1, label: 'Receipt', type: 'input' as const },
    { id: 2, label: 'Putaway', type: 'input' as const },
    { id: 3, label: 'Storage', type: 'approval' as const },
    { id: 4, label: 'Picking', type: 'posting' as const },
    { id: 5, label: 'Packing', type: 'posting' as const },
    { id: 6, label: 'Shipping', type: 'completion' as const }
  ];

  const forms = [
    { id: 'rec', name: 'Goods Receipt', sequence: 1, required: true, glAccounts: ['GL-1200', 'GL-1400'] },
    { id: 'put', name: 'Putaway Order', sequence: 2, required: true, glAccounts: ['GL-1200', 'GL-1400'] },
    { id: 'stor', name: 'Storage Location', sequence: 3, required: true, glAccounts: [] },
    { id: 'pick', name: 'Pick List', sequence: 4, required: true, glAccounts: ['GL-1200', 'GL-1400'] },
    { id: 'pack', name: 'Pack Slip', sequence: 5, required: true, glAccounts: [] },
    { id: 'ship', name: 'Shipment', sequence: 6, required: true, glAccounts: ['GL-5200'] }
  ];

  const glAccounts = [
    { account: 'GL-1200', description: 'Raw Materials', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-1400', description: 'Finished Goods', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-5200', description: 'Shipping & Handling', type: 'expense', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'Receipt Processing Time', value: '2.1 hours', target: '<4 hours', status: 'good' as const, trend: 'stable' as const },
    { label: 'Putaway Accuracy', value: '99.2%', target: '>99%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Pick Accuracy', value: '99.5%', target: '>99%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Inventory Turnover', value: '8.2x', target: '>8x', status: 'good' as const, trend: 'stable' as const },
    { label: 'Shipping On-Time', value: '97%', target: '>95%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Cycle Count Variance', value: '0.2%', target: '<0.5%', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="warehouse-management"
      processName="Warehouse Management"
      processCode="P015"
      description="Complete warehouse operations from goods receipt and quality inspection through putaway, storage, picking, packing, and shipment including cycle counting and inventory reconciliation."
      category="Operations"
      criticality="HIGH"
      cycleTime="Continuous"
      formsCount={6}
      glAccountsCount={3}
      approvalSteps={1}
      relatedProcesses={['Inventory Management', 'Procure-to-Pay', 'Order-to-Cash', 'Production Planning']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Warehouse Management executes the physical logistics of inventory. Receipt processes validate incoming shipments, update inventory records, and direct putaway. Storage optimization places items for efficient picking. Picking operations select items for customer orders or production. Packing consolidates shipments with proper labeling. Shipping arranges carrier pickup and updates customers.
            </p>
            <p>
              Key performance metrics include receipt accuracy, putaway speed, pick accuracy, and on-time shipping. Cycle counting maintains inventory accuracy throughout the period. GL integration tracks inventory movements between locations and jurisdictions.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Warehouse System</div>
            <div className="text-lg font-semibold text-foreground mt-2">WMS with Real-Time Tracking</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Locations Managed</div>
            <div className="text-lg font-semibold text-foreground mt-2">3 main warehouses</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Warehouse Management Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Goods receipt with vendor validation, quality check, and receiving inspection.</p>
            <p><strong>Step 2:</strong> Putaway directive places items in optimal storage location.</p>
            <p><strong>Step 3:</strong> Storage location tracking for inventory visibility and cycle counting.</p>
            <p><strong>Step 4:</strong> Picking fulfills customer orders or production requirements.</p>
            <p><strong>Step 5:</strong> Packing consolidates items with packing slip and shipping labels.</p>
            <p><strong>Step 6:</strong> Shipment arrangement and carrier pickup notification.</p>
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
