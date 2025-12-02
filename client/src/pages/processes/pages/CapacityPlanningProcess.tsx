import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export default function CapacityPlanningProcess() {
  const flowSteps = [
    { id: 1, label: 'Demand', type: 'input' as const },
    { id: 2, label: 'Assessment', type: 'input' as const },
    { id: 3, label: 'Gap Analysis', type: 'approval' as const },
    { id: 4, label: 'Planning', type: 'posting' as const },
    { id: 5, label: 'Action', type: 'posting' as const },
    { id: 6, label: 'Monitoring', type: 'completion' as const }
  ];

  const forms = [
    { id: 'dem', name: 'Demand Forecast', sequence: 1, required: true, glAccounts: [] },
    { id: 'cap', name: 'Capacity Assessment', sequence: 2, required: true, glAccounts: [] },
    { id: 'gap', name: 'Gap Analysis', sequence: 3, required: true, glAccounts: [] },
    { id: 'plan', name: 'Capacity Plan', sequence: 4, required: true, glAccounts: ['GL-1500'] },
    { id: 'action', name: 'Capacity Action', sequence: 5, required: true, glAccounts: ['GL-5000', 'GL-6100'] },
    { id: 'mon', name: 'Utilization Monitoring', sequence: 6, required: true, glAccounts: [] }
  ];

  const glAccounts = [
    { account: 'GL-1500', description: 'Fixed Assets', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-5000', description: 'Equipment Purchases', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-6100', description: 'Labor Costs', type: 'expense', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'Capacity Utilization', value: '82%', target: '75-85%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Equipment Downtime', value: '2.1%', target: '<3%', status: 'good' as const, trend: 'down' as const },
    { label: 'Bottleneck Identified', value: 'None', target: 'None', status: 'good' as const, trend: 'stable' as const },
    { label: 'Labor Efficiency', value: '91%', target: '>85%', status: 'good' as const, trend: 'up' as const },
    { label: 'Lead Time Achievement', value: '97%', target: '>95%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Capacity Plan Accuracy', value: '94%', target: '>90%', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="capacity-planning"
      processName="Capacity Planning"
      processCode="P014"
      description="Determination of equipment, labor, and facility resources needed to meet projected demand. Includes assessment of current capacity, gap analysis, planning for additions or reductions, and ongoing utilization monitoring."
      category="Manufacturing"
      criticality="HIGH"
      cycleTime="Quarterly"
      formsCount={6}
      glAccountsCount={3}
      approvalSteps={2}
      relatedProcesses={['Demand Planning', 'Production Planning', 'Budget Planning', 'Fixed Asset Lifecycle']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Capacity Planning ensures manufacturing can meet forecasted demand without overloading or underutilizing resources. Starting with the demand forecast, the process assesses current equipment, labor, and facility capacity. Gaps are identified where demand exceeds available capacity or where excess capacity exists. Planning decisions include equipment purchases, labor hiring/attrition, shift scheduling, or outsourcing.
            </p>
            <p>
              Bottleneck identification drives targeted investment. Ongoing utilization monitoring ensures plans stay current and capacity-demand balance is maintained. Equipment investments flow through GL-1500, labor costs through GL-6100.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Target Utilization</div>
            <div className="text-lg font-semibold text-foreground mt-2">75-85%</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Planning Horizon</div>
            <div className="text-lg font-semibold text-foreground mt-2">12-24 months</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Capacity Planning Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Demand forecast input by product, line, and time period.</p>
            <p><strong>Step 2:</strong> Assessment of current equipment, labor, and facility capacity constraints.</p>
            <p><strong>Step 3:</strong> Gap analysis identifying bottlenecks and excess capacity.</p>
            <p><strong>Step 4:</strong> Capacity plan with equipment purchases, labor plans, or outsourcing.</p>
            <p><strong>Step 5:</strong> Action execution for equipment purchases or staffing changes.</p>
            <p><strong>Step 6:</strong> Ongoing utilization monitoring and variance reporting.</p>
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
