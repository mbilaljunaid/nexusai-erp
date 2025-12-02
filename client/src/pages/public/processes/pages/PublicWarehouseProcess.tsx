import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export default function PublicWarehouseProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Warehouse Management"
      processCode="P015"
      criticality="HIGH"
      category="Operations"
      cycletime="Continuous"
      description="Warehouse operations from goods receipt through putaway, storage, picking, packing, and shipment"
      flowSteps={[
        { label: 'Receipt', description: 'Goods received and quality checked' },
        { label: 'Putaway', description: 'Directive places items in storage location' },
        { label: 'Storage', description: 'Location tracking for inventory visibility' },
        { label: 'Picking', description: 'Fulfill customer and production orders' },
        { label: 'Packing', description: 'Consolidate items with labels and pack slip' },
        { label: 'Shipping', description: 'Arrange carrier pickup and tracking' }
      ]}
      moduleMappings={[
        {
          module: 'Warehouse',
          forms: ['Goods Receipt', 'Putaway Order', 'Storage Location', 'Pick List'],
          impact: 'Warehouse operations transactions'
        },
        {
          module: 'Inventory',
          forms: ['Inventory Receipt', 'Inventory Issuance', 'Inventory Transfer', 'Cycle Count'],
          impact: 'Inventory transaction processing'
        },
        {
          module: 'Quality',
          forms: ['Receipt Inspection', 'Putaway Verification', 'Pick Verification', 'Pack Verification'],
          impact: 'Quality control in warehouse'
        },
        {
          module: 'Logistics',
          forms: ['Pack Slip', 'Shipment', 'Tracking', 'Delivery Confirmation'],
          impact: 'Shipping and delivery management'
        }
      ]}
      keyBenefits={[
        'Receipt processing time of 2.1 hours',
        'Putaway accuracy of 99.2%',
        'Pick accuracy of 99.5%',
        'Inventory turnover of 8.2x',
        'Shipping on-time at 97%',
        'Cycle count variance of 0.2%'
      ]}
      glAccounts={['GL-1200', 'GL-1400', 'GL-5200']}
    />
  );
}
