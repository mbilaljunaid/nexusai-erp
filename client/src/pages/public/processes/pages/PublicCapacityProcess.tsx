import { Header, Footer } from "@/components/Navigation";
import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export default function PublicCapacityProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Capacity Planning"
      processCode="P014"
      criticality="HIGH"
      category="Manufacturing"
      cycletime="Quarterly"
      description="Equipment, labor, and facility resource planning to meet projected demand"
      flowSteps={[
        { label: 'Demand', description: 'Demand forecast input by product and period' },
        { label: 'Assessment', description: 'Assess current equipment, labor, facility capacity' },
        { label: 'Gap Analysis', description: 'Identify bottlenecks and excess capacity' },
        { label: 'Planning', description: 'Plan equipment purchases or labor hiring' },
        { label: 'Action', description: 'Execute equipment or staffing changes' },
        { label: 'Monitoring', description: 'Monitor utilization and adjust plans' }
      ]}
      moduleMappings={[
        {
          module: 'Planning',
          forms: ['Demand Forecast', 'Capacity Assessment', 'Gap Analysis', 'Capacity Plan'],
          impact: 'Capacity planning inputs and plans'
        },
        {
          module: 'Manufacturing',
          forms: ['Equipment Master', 'Equipment Utilization', 'Labor Plan', 'Shift Plan'],
          impact: 'Equipment and labor resource tracking'
        },
        {
          module: 'Finance',
          forms: ['Equipment Budget', 'Capital Budget', 'Labor Budget'],
          impact: 'Capacity investment planning'
        },
        {
          module: 'Operations',
          forms: ['Utilization Report', 'Downtime Report', 'Bottleneck Alert', 'OEE Tracking'],
          impact: 'Operations monitoring and reporting'
        }
      ]}
      keyBenefits={[
        'Capacity utilization optimized to 82%',
        'Equipment downtime reduced to 2.1%',
        'Bottleneck issues identified proactively',
        'Labor efficiency improved to 91%',
        'Lead time achievement at 97%',
        'Capacity plan accuracy at 94%'
      ]}
      glAccounts={['GL-1500', 'GL-5000', 'GL-6100']}
    />
  );
}
