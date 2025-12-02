import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export function BudgetPlanningProcess() {
  const flowSteps = [
    { id: 1, label: 'Assumptions', type: 'input' as const },
    { id: 2, label: 'Department Budgets', type: 'input' as const },
    { id: 3, label: 'Consolidation', type: 'approval' as const },
    { id: 4, label: 'GL Loading', type: 'posting' as const },
    { id: 5, label: 'Analysis', type: 'posting' as const },
    { id: 6, label: 'Approval', type: 'completion' as const }
  ];

  const forms = [
    { id: 'assume', name: 'Budget Assumptions', sequence: 1, required: true, glAccounts: [] },
    { id: 'dept', name: 'Department Budget', sequence: 2, required: true, glAccounts: ['GL-3000'] },
    { id: 'cons', name: 'Budget Consolidation', sequence: 3, required: true, glAccounts: ['GL-3000'] },
    { id: 'load', name: 'GL Budget Loading', sequence: 4, required: true, glAccounts: ['GL-3000'] },
    { id: 'var', name: 'Variance Analysis', sequence: 5, required: true, glAccounts: ['GL-3000', 'GL-3100'] },
    { id: 'app', name: 'Budget Approval', sequence: 6, required: true, glAccounts: [] }
  ];

  const glAccounts = [
    { account: 'GL-3000', description: 'Budget Master (Memo Account)', type: 'other', debitCredit: 'Dr' as const },
    { account: 'GL-3100', description: 'Budget Variance', type: 'other', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'Budget Cycle Time', value: '45 days', target: '<60 days', status: 'good' as const, trend: 'stable' as const },
    { label: 'Department Submission Rate', value: '98%', target: '100%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Actual vs Budget', value: '2.1%', target: '<3%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Forecast Accuracy', value: '94%', target: '>90%', status: 'good' as const, trend: 'up' as const },
    { label: 'Monthly Variance Report', value: 'On-Time', target: 'On-Time', status: 'good' as const, trend: 'stable' as const },
    { label: 'Re-forecast Triggers', value: '3', target: '<4', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="budget-planning"
      processName="Budget Planning & Variance"
      processCode="P012"
      description="Comprehensive annual budget planning process including assumption setting, departmental budgeting, consolidation, GL loading, variance analysis, and management reporting for performance monitoring."
      category="Finance"
      criticality="CRITICAL"
      cycleTime="60 days (Annual)"
      formsCount={6}
      glAccountsCount={2}
      approvalSteps={3}
      relatedProcesses={['Month-End Consolidation', 'Fixed Asset Lifecycle', 'Demand Planning']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The annual budget process starts with key assumptions (volume, pricing, inflation) established by senior management. Departments build bottom-up budgets constrained by the corporate plan. Budgets are consolidated, validated, and loaded into the GL as memo accounts. Throughout the fiscal year, actual results are compared to budget, variances analyzed, and forecasts updated as needed.
            </p>
            <p>
              Budget variance analysis drives management decision-making and business performance discussions. Significant variance triggers investigation and corrective action. Quarterly re-forecasts update full-year projections based on current performance.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Planning Approach</div>
            <div className="text-lg font-semibold text-foreground mt-2">Rolling Forecast</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Variance Threshold</div>
            <div className="text-lg font-semibold text-foreground mt-2">3% or $100K</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Budget Planning & Variance Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Corporate assumptions set (revenue growth, cost inflation, headcount plan).</p>
            <p><strong>Step 2:</strong> Departments prepare detailed budgets for revenue, expenses, and capital.</p>
            <p><strong>Step 3:</strong> Finance consolidates, eliminates intercompany items, validates totals.</p>
            <p><strong>Step 4:</strong> Budget loaded as memo GL entries for variance tracking.</p>
            <p><strong>Step 5:</strong> Monthly actual vs budget variance analysis and trend forecasting.</p>
            <p><strong>Step 6:</strong> Executive approval and Board presentation of budget and monthly performance.</p>
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
