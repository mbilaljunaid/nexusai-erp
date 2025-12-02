import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export function FixedAssetLifecycleProcess() {
  const flowSteps = [
    { id: 1, label: 'Requisition', type: 'input' as const },
    { id: 2, label: 'Approval', type: 'approval' as const },
    { id: 3, label: 'Receipt', type: 'input' as const },
    { id: 4, label: 'Activation', type: 'posting' as const },
    { id: 5, label: 'Depreciation', type: 'posting' as const },
    { id: 6, label: 'Disposal', type: 'completion' as const }
  ];

  const forms = [
    { id: 'req', name: 'Asset Requisition', sequence: 1, required: true, glAccounts: ['GL-1500'] },
    { id: 'po', name: 'Purchase Order', sequence: 2, required: true, glAccounts: ['GL-1500'] },
    { id: 'rec', name: 'Asset Receipt', sequence: 3, required: true, glAccounts: ['GL-1500', 'GL-2100'] },
    { id: 'act', name: 'Asset Activation', sequence: 4, required: true, glAccounts: ['GL-1500', 'GL-1501'] },
    { id: 'depr', name: 'Depreciation Schedule', sequence: 5, required: true, glAccounts: ['GL-1501', 'GL-6200'] },
    { id: 'disp', name: 'Asset Disposal', sequence: 6, required: true, glAccounts: ['GL-1500', 'GL-1501', 'GL-6900'] }
  ];

  const glAccounts = [
    { account: 'GL-1500', description: 'Fixed Assets (Gross)', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-1501', description: 'Accumulated Depreciation', type: 'asset', debitCredit: 'Cr' as const },
    { account: 'GL-6200', description: 'Depreciation Expense', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-6300', description: 'Maintenance Expense', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-6900', description: 'Gain/Loss on Disposal', type: 'expense', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'Asset Utilization', value: '82%', target: '>80%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Depreciation Accuracy', value: '100%', target: '100%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Disposal Timeliness', value: '95%', target: '>90%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Asset ROI', value: '18%', target: '>15%', status: 'good' as const, trend: 'up' as const },
    { label: 'Maintenance Cost %', value: '2.1%', target: '<2.5%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Impairment Found', value: '0', target: '0', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="fixed-asset-lifecycle"
      processName="Fixed Asset Lifecycle"
      processCode="P007"
      description="Complete asset management from acquisition through depreciation tracking to final disposal. Includes asset requisition, purchase, receipt, activation, periodic depreciation posting, and end-of-life processing."
      category="Finance"
      criticality="HIGH"
      cycleTime="Lifecycle"
      formsCount={7}
      glAccountsCount={5}
      approvalSteps={2}
      relatedProcesses={['Procure-to-Pay', 'Budget Planning', 'Month-End Consolidation']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The Fixed Asset Lifecycle process manages all capital assets from acquisition through retirement. Assets are requisitioned based on business need, purchased through the P2P process, received and activated, then systematically depreciated over their useful life. Monthly depreciation entries flow to the GL, and assets are ultimately disposed when no longer needed.
            </p>
            <p>
              The process tracks asset location, responsible party, depreciation method, and maintenance history. Key GL controls include asset capitalization thresholds, depreciation calculations, impairment testing, and gain/loss on disposal recognition.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Capitalization Threshold</div>
            <div className="text-lg font-semibold text-foreground mt-2">$5,000 USD</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Depreciation Methods</div>
            <div className="text-lg font-semibold text-foreground mt-2">Straight-line, Declining Balance</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Fixed Asset Lifecycle Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Asset Requisition - Department requests equipment/asset with business justification.</p>
            <p><strong>Step 2:</strong> Approval - Manager and Finance Director approve capital investment.</p>
            <p><strong>Step 3:</strong> Receipt & Inspection - Asset received, inspected, serial number recorded.</p>
            <p><strong>Step 4:</strong> Activation - Asset placed in service, useful life and method determined.</p>
            <p><strong>Step 5:</strong> Monthly Depreciation - GL entries record depreciation expense and accumulated depreciation.</p>
            <p><strong>Step 6:</strong> Disposal - End-of-life asset retired, GL entries record removal and gain/loss.</p>
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
