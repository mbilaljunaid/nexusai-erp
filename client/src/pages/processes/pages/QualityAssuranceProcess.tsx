import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ProcessPageTemplate } from '../templates/ProcessPageTemplate';
import { ProcessFlowDiagram } from '../components/ProcessFlowDiagram';
import { FormsList } from '../components/FormsList';
import { GLMappingPanel } from '../components/GLMappingPanel';
import { KPIMetrics } from '../components/KPIMetrics';
import { Card } from '@/components/ui/card';

export function QualityAssuranceProcess() {
  const flowSteps = [
    { id: 1, label: 'Incoming QC', type: 'input' as const },
    { id: 2, label: 'Inspection', type: 'approval' as const },
    { id: 3, label: 'Disposition', type: 'input' as const },
    { id: 4, label: 'Process Control', type: 'posting' as const },
    { id: 5, label: 'NCR', type: 'input' as const },
    { id: 6, label: 'CAP', type: 'completion' as const }
  ];

  const forms = [
    { id: 'inqc', name: 'Incoming QC Inspection', sequence: 1, required: true, glAccounts: ['GL-5150'] },
    { id: 'disp', name: 'Inspection Disposition', sequence: 2, required: true, glAccounts: ['GL-1200', 'GL-5100'] },
    { id: 'pc', name: 'Process Control Chart', sequence: 3, required: true, glAccounts: [] },
    { id: 'ncr', name: 'Non-Conformance Report', sequence: 4, required: true, glAccounts: ['GL-5150'] },
    { id: 'cap', name: 'Corrective Action Plan', sequence: 5, required: true, glAccounts: [] }
  ];

  const glAccounts = [
    { account: 'GL-1200', description: 'Raw Materials', type: 'asset', debitCredit: 'Dr' as const },
    { account: 'GL-5100', description: 'Scrap/Rework', type: 'expense', debitCredit: 'Dr' as const },
    { account: 'GL-5150', description: 'Quality Control', type: 'expense', debitCredit: 'Dr' as const }
  ];

  const metrics = [
    { label: 'Inspection Pass Rate', value: '96.5%', target: '>95%', status: 'good' as const, trend: 'stable' as const },
    { label: 'Incoming Defect Rate', value: '0.3%', target: '<0.5%', status: 'good' as const, trend: 'down' as const },
    { label: 'Process Capability (Cpk)', value: '1.45', target: '>1.33', status: 'good' as const, trend: 'up' as const },
    { label: 'NCR Resolution Days', value: '4.2 days', target: '<5 days', status: 'good' as const, trend: 'stable' as const },
    { label: 'Scrap Rate', value: '0.8%', target: '<1%', status: 'good' as const, trend: 'stable' as const },
    { label: 'On-Time QC', value: '98%', target: '100%', status: 'good' as const, trend: 'stable' as const }
  ];

  return (
    <ProcessPageTemplate
      processId="quality-assurance"
      processName="Quality Assurance & Control"
      processCode="P010"
      description="Complete quality management system covering incoming inspection, process control, non-conformance reporting, and corrective actions. Includes statistical process control and continuous improvement."
      category="Manufacturing"
      criticality="CRITICAL"
      cycleTime="Ongoing"
      formsCount={5}
      glAccountsCount={3}
      approvalSteps={2}
      relatedProcesses={['Production Planning', 'Inventory Management', 'Vendor Performance Management']}
    >
      <TabsContent value="overview" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Executive Summary</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Quality Assurance encompasses the planned and systematic activities to ensure products and services meet specified requirements. Incoming QC inspects purchased materials against acceptance criteria. Process Control uses statistical techniques to maintain process performance. Non-Conformance Reports document defects, and Corrective Action Plans systematically resolve root causes.
            </p>
            <p>
              QA costs (inspection, testing, rework) flow through GL-5150. Product acceptance/rejection impacts inventory (GL-1200). Scrap and rework costs are tracked separately for management visibility and continuous improvement initiatives.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Quality Standard</div>
            <div className="text-lg font-semibold text-foreground mt-2">ISO 9001:2015</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Key Metrics</div>
            <div className="text-lg font-semibold text-foreground mt-2">Cpk, AQL, DPMO</div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="flow" className="space-y-6">
        <ProcessFlowDiagram steps={flowSteps} title="Quality Assurance & Control Flow" />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Process Steps</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1:</strong> Incoming QC - Inspect received materials against acceptance criteria (AQL sampling).</p>
            <p><strong>Step 2:</strong> Inspection - Record measurements, visual inspection, functional testing results.</p>
            <p><strong>Step 3:</strong> Disposition - Accept, reject, or hold for disposition (rework, scrap).</p>
            <p><strong>Step 4:</strong> Process Control - Monitor production processes with control charts to ensure stability.</p>
            <p><strong>Step 5:</strong> NCR - Document nonconforming parts/processes with root cause analysis.</p>
            <p><strong>Step 6:</strong> CAP - Implement corrective actions to prevent recurrence.</p>
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
