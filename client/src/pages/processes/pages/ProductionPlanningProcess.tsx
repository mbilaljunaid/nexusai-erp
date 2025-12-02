import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export default function ProductionPlanningProcess() {
  const flowSteps = [
    { id: 1, label: 'Forecast', type: 'input' as const },
    { id: 2, label: 'MPS', type: 'approval' as const },
    { id: 3, label: 'BOM', type: 'input' as const },
    { id: 4, label: 'Work Order', type: 'input' as const },
    { id: 5, label: 'Production', type: 'posting' as const },
    { id: 6, label: 'QC/FG', type: 'completion' as const }
  ];

  const forms = [
    { id: 'fc', name: 'Sales Forecast', sequence: 1, required: true, glAccounts: [] },
    { id: 'mps', name: 'Master Production Schedule', sequence: 2, required: true, glAccounts: [] },
    { id: 'bom', name: 'Bill of Materials', sequence: 3, required: true, glAccounts: [] },
    { id: 'wo', name: 'Work Order', sequence: 4, required: true, glAccounts: ['GL-1300', 'GL-6110'] },
    { id: 'prod', name: 'Production Execution', sequence: 5, required: true, glAccounts: ['GL-1300', 'GL-1200'] },
    { id: 'qc', name: 'QC Inspection', sequence: 6, required: true, glAccounts: ['GL-5150'] },
    { id: 'fg', name: 'Finished Goods', sequence: 7, required: true, glAccounts: ['GL-1400'] }
  ];

  const glAccounts = [
    { account: 'GL-1300', description: 'Work in Progress', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-1200', description: 'Raw Materials', type: 'asset', debitCredit: 'Cr' as const },
    { account: 'GL-1400', description: 'Finished Goods', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-6110', description: 'Direct Labor', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-6400', description: 'Manufacturing Variance', type: 'expense', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'On-Time Completion', value: '97%', target: '95%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Production Efficiency', value: '89%', target: '>85%', status: 'good' as const, trend: 'up' as const },
    { label: 'Yield %', value: '94.2%', target: '>92%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Cost Variance', value: '1.8%', target: '<2%', status: 'good' as const, trend: 'stable' as const },
    { label: 'WIP Inventory Days', value: '5.2 days', target: '<6 days', status: 'good' as const, trend: 'stable' as const },
    { label: 'Scrap Rate', value: '0.8%', target: '<1%', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="production-planning"
      processName="Production Planning & Execution"
      processCode="P008"
      description="Complete production cycle from sales forecast through master production schedule, bill of materials definition, work order creation, production execution, quality inspection, and finished goods receipt."
      category="Manufacturing"
      criticality="HIGH"
      cycleTime="Varies"
      formsCount={10}
      glAccountsCount={5}
      approvalSteps={2}
      relatedProcesses={['Demand Planning', 'Material Requirements Planning', 'Capacity Planning', 'Quality Assurance']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Production Planning transforms demand forecasts into detailed manufacturing schedules. The Master Production Schedule (MPS) defines what products to make and when. Bill of Materials (BOM) explosions determine component needs. Work orders are released to the shop floor with detailed routings and labor allocations. Production execution is tracked with labor hours and material consumption, costs flow through Work in Progress, and completed products move to Finished Goods.
            </p>
            <p>
              The process integrates with inventory management for material picking, capacity planning for resource availability, quality assurance for process control, and the GL system for real-time production cost tracking.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Primary GL Impact</div>
            <div className="text-lg font-semibold text-foreground mt-2">GL-1300 (WIP), GL-1400 (FG)</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Cost Accumulation</div>
            <div className="text-lg font-semibold text-foreground mt-2">Material + Labor + Overhead</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Production Planning & Execution Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Sales Forecast - Demand projection by product, by period.</p>
            <p><strong>Step 2:</strong> Master Production Schedule - What to make, when, in what quantities.</p>
            <p><strong>Step 3:</strong> Bill of Materials - Components and quantities per product.</p>
            <p><strong>Step 4:</strong> Work Order - Manufacturing order with routing, labor, setup time.</p>
            <p><strong>Step 5:</strong> Production Execution - Labor time tracking, material consumption, machine usage.</p>
            <p><strong>Step 6:</strong> QC & Finished Goods - Final inspection, GL post to FG inventory.</p>
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
