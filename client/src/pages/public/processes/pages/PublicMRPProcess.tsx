import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export function PublicMRPProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Material Requirements Planning"
      processCode="P009"
      criticality="HIGH"
      category="Manufacturing"
      cycletime="Weekly"
      description="Automated material needs determination with BOM explosion, inventory netting, and planned order generation"
      flowSteps={[
        { label: 'MPS Input', description: 'Master Production Schedule input' },
        { label: 'BOM Explosion', description: 'Component requirements calculation' },
        { label: 'Inventory Netting', description: 'Gross requirements minus on-hand inventory' },
        { label: 'Lead Time', description: 'Schedule material arrival with lead time offset' },
        { label: 'Planned Orders', description: 'Procurement and production order generation' },
        { label: 'Order Release', description: 'Approval and release of planned orders' }
      ]}
      moduleMappings={[
        {
          module: 'Planning',
          forms: ['MPS', 'BOM', 'Bill of Materials Version', 'Phantom BOM'],
          impact: 'Production planning structures'
        },
        {
          module: 'MRP',
          forms: ['MRP Run', 'Planned Order', 'Planned Purchase Order', 'Planned Work Order'],
          impact: 'Material requirements planning execution'
        },
        {
          module: 'Inventory',
          forms: ['Available Inventory', 'Lead Time', 'Safety Stock', 'EOQ Calculation'],
          impact: 'Inventory parameters and calculations'
        },
        {
          module: 'Procurement',
          forms: ['Purchase Requisition', 'Planned Procurement', 'Supplier Order'],
          impact: 'Procurement order generation'
        }
      ]}
      keyBenefits={[
        'Forecast accuracy maintained at 91%+',
        'Stockout rate reduced to 0.8%',
        'Safety stock level optimized to 14 days',
        'Order point accuracy at 96%+',
        'Carrying cost controlled to 2.3%',
        'EOQ compliance at 94%'
      ]}
      glAccounts={['GL-1200', 'GL-5000', 'GL-6500']}
    />
  );
}
