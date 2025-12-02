import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export default function DemandPlanningProcess() {
  const flowSteps = [
    { id: 1, label: 'History', type: 'input' as const },
    { id: 2, label: 'Forecast', type: 'input' as const },
    { id: 3, label: 'Demand Plan', type: 'approval' as const },
    { id: 4, label: 'Supply Plan', type: 'posting' as const },
    { id: 5, label: 'Scenario', type: 'posting' as const },
    { id: 6, label: 'Release', type: 'completion' as const }
  ];

  const forms = [
    { id: 'hist', name: 'Historical Sales', sequence: 1, required: true, glAccounts: ['GL-4000'] },
    { id: 'fc', name: 'Sales Forecast', sequence: 2, required: true, glAccounts: [] },
    { id: 'dp', name: 'Demand Plan', sequence: 3, required: true, glAccounts: [] },
    { id: 'sp', name: 'Supply Plan', sequence: 4, required: true, glAccounts: ['GL-5000'] },
    { id: 'scen', name: 'Scenario Analysis', sequence: 5, required: false, glAccounts: [] },
    { id: 'rel', name: 'Plan Release', sequence: 6, required: true, glAccounts: [] }
  ];

  const glAccounts = [
    { account: 'GL-4000', description: 'Revenue', type: 'revenue', debitCredit: 'Cr' as const },
    { account: 'GL-5000', description: 'Purchases', type: 'expense', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'Forecast Accuracy', value: '91%', target: '>85%', status: 'good' as const, trend: 'up' as const },
    { label: 'Planning Cycle', value: '30 days', target: '<30 days', status: 'good' as const, trend: 'stable' as const },
    { label: 'MAPE %', value: '7.2%', target: '<10%', status: 'good' as const, trend: 'down' as const },
    { label: 'Demand Signals Captured', value: '94%', target: '>90%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Promotional Uplift', value: '98.5%', target: '>95%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Seasonal Pattern Match', value: '96%', target: '>95%', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="demand-planning"
      processName="Demand Planning & Forecasting"
      processCode="P013"
      description="Statistical and collaborative demand forecasting combining historical sales analysis, marketing inputs, and supply chain signals to drive production planning, procurement, and inventory strategy."
      category="Supply Chain"
      criticality="HIGH"
      cycleTime="Monthly"
      formsCount={6}
      glAccountsCount={2}
      approvalSteps={2}
      relatedProcesses={['Production Planning', 'Material Requirements Planning', 'Inventory Management', 'Capacity Planning']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Demand Planning is the critical first step in the Demand-Driven Supply Chain. The process begins with historical sales analysis, applies statistical forecasting methods, incorporates qualitative inputs from sales and marketing, and generates a consensus demand plan. This plan cascades through MRP, capacity planning, production scheduling, and procurement.
            </p>
            <p>
              Accurate demand forecasting minimizes safety stock, reduces excess inventory, prevents stockouts, and improves cash flow. Collaborative planning involving sales, operations, and finance ensures alignment between market signals and operational execution.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Planning Horizon</div>
            <div className="text-lg font-semibold text-foreground mt-2">12-18 months forward</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Forecasting Methods</div>
            <div className="text-lg font-semibold text-foreground mt-2">Time Series + Regression</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Demand Planning & Forecasting Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Historical sales analysis with seasonality and trend analysis.</p>
            <p><strong>Step 2:</strong> Statistical forecasting using exponential smoothing or regression methods.</p>
            <p><strong>Step 3:</strong> Demand plan built by product/region/customer with collaborative adjustments.</p>
            <p><strong>Step 4:</strong> Supply plan developed to ensure material and capacity availability.</p>
            <p><strong>Step 5:</strong> Scenario planning for upside/downside demand variations.</p>
            <p><strong>Step 6:</strong> Plan released to drive MPS, MRP, and procurement activities.</p>
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
