import { Header, Footer } from "@/components/Navigation";
import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export default function PublicProductionProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Production Planning & Execution"
      processCode="P008"
      criticality="HIGH"
      category="Manufacturing"
      cycletime="Varies"
      description="Complete production cycle from forecast through master production schedule, bill of materials, and finished goods"
      flowSteps={[
        { label: 'Forecast', description: 'Sales demand projection by product and period' },
        { label: 'MPS', description: 'Master Production Schedule defining what to make' },
        { label: 'BOM', description: 'Bill of Materials with component quantities' },
        { label: 'Work Order', description: 'Manufacturing order with routing and labor' },
        { label: 'Production', description: 'Labor tracking and material consumption' },
        { label: 'Finished Goods', description: 'QC inspection and inventory completion' }
      ]}
      moduleMappings={[
        {
          module: 'Planning',
          forms: ['Sales Forecast', 'Master Production Schedule', 'Capacity Check'],
          impact: 'Production planning and scheduling'
        },
        {
          module: 'Manufacturing',
          forms: ['Bill of Materials', 'Work Order', 'Labor Tracking', 'Machine Setup'],
          impact: 'Production execution and tracking'
        },
        {
          module: 'Quality',
          forms: ['Process Control', 'Inspection', 'Non-Conformance', 'Corrective Action'],
          impact: 'Quality assurance during manufacturing'
        },
        {
          module: 'Finance',
          forms: ['WIP Journal Entry', 'COGS Calculation', 'Variance Analysis', 'FG Completion'],
          impact: 'Production cost accounting'
        }
      ]}
      keyBenefits={[
        'On-time completion improved to 97%',
        'Production efficiency increased to 89%',
        'Yield improved to 94.2% with waste reduction',
        'Cost variance maintained below 2%',
        'WIP inventory reduced to 5.2 days',
        'Scrap rate reduced to 0.8%'
      ]}
      glAccounts={['GL-1300', 'GL-1400', 'GL-1200', 'GL-6110', 'GL-6400']}
    />
  );
}
