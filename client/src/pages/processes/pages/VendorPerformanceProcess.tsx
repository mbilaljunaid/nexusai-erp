import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export default function VendorPerformanceProcess() {
  const flowSteps = [
    { id: 1, label: 'Scorecard', type: 'input' as const },
    { id: 2, label: 'Metrics', type: 'input' as const },
    { id: 3, label: 'Evaluation', type: 'approval' as const },
    { id: 4, label: 'Review', type: 'posting' as const },
    { id: 5, label: 'Action', type: 'posting' as const },
    { id: 6, label: 'Improvement', type: 'completion' as const }
  ];

  const forms = [
    { id: 'score', name: 'Scorecard Template', sequence: 1, required: true, glAccounts: [] },
    { id: 'met', name: 'Performance Metrics', sequence: 2, required: true, glAccounts: ['GL-5000'] },
    { id: 'eval', name: 'Vendor Evaluation', sequence: 3, required: true, glAccounts: [] },
    { id: 'rev', name: 'Review Meeting', sequence: 4, required: true, glAccounts: [] },
    { id: 'action', name: 'Action Plan', sequence: 5, required: false, glAccounts: [] },
    { id: 'imp', name: 'Improvement Tracking', sequence: 6, required: true, glAccounts: [] }
  ];

  const glAccounts = [
    { account: 'GL-5000', description: 'Purchases', type: 'expense', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'On-Time Delivery', value: '96.2%', target: '>95%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Quality (Defect Rate)', value: '0.4%', target: '<1%', status: 'good' as const, trend: 'down' as const },
    { label: 'Price Competitiveness', value: '89%', target: '>85%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Responsiveness Score', value: '92%', target: '>90%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Overall Score', value: '93.8%', target: '>90%', status: 'good' as const, trend: 'up' as const },
    { label: 'Active Vendors', value: '87', target: '>50', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="vendor-performance"
      processName="Vendor Performance Management"
      processCode="P017"
      description="Systematic evaluation of supplier performance using scorecards covering on-time delivery, quality, price, responsiveness, and compliance. Performance insights drive improvement plans and vendor selection decisions."
      category="Procurement"
      criticality="HIGH"
      cycleTime="Quarterly"
      formsCount={6}
      glAccountsCount={1}
      approvalSteps={2}
      relatedProcesses={['Procure-to-Pay', 'Quality Assurance', 'Inventory Management']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Vendor Performance Management systematically evaluates supplier performance across multiple dimensions. On-time delivery measures logistics reliability. Quality metrics track defect rates. Price competitiveness compares actual costs to market benchmarks. Responsiveness covers issue resolution and communication. Scorecards aggregate these metrics into an overall vendor rating.
            </p>
            <p>
              Poor performers are placed on improvement plans with specific targets and timelines. Consistently strong vendors become preferred suppliers eligible for longer contracts and volume discounts. Vendor segmentation (A, B, C) focuses management attention on critical suppliers.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Rating Scale</div>
            <div className="text-lg font-semibold text-foreground mt-2">A (90%+), B (80-90%), C (&lt;80%)</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Review Frequency</div>
            <div className="text-lg font-semibold text-foreground mt-2">Quarterly + Ad-hoc</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Vendor Performance Management Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Scorecard design with weighted metrics (delivery 30%, quality 25%, price 20%, responsiveness 25%).</p>
            <p><strong>Step 2:</strong> Performance data collection from PO, receipt, and quality records.</p>
            <p><strong>Step 3:</strong> Vendor evaluation calculating weighted score and determining rating category.</p>
            <p><strong>Step 4:</strong> Performance review meeting with vendor to discuss results and issues.</p>
            <p><strong>Step 5:</strong> Action plan development for underperforming vendors with specific improvement targets.</p>
            <p><strong>Step 6:</strong> Improvement tracking with monthly or quarterly review of progress.</p>
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
