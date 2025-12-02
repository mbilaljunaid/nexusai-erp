import { Header, Footer } from "@/components/Navigation";
import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export default function PublicInventoryProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Inventory Management"
      processCode="P006"
      criticality="HIGH"
      category="Operations"
      cycletime="Daily"
      description="Complete inventory management from item master through receipt, issuance, and cycle counting"
      flowSteps={[
        { label: 'Item Master', description: 'Define item characteristics, locations, and stocking rules' },
        { label: 'Receipt', description: 'Receive goods, inspect quality, and update inventory' },
        { label: 'Issuance', description: 'Issue materials to production or sales orders' },
        { label: 'Adjustment', description: 'Reconcile actual count to system records' },
        { label: 'Cycle Count', description: 'Periodic inventory count and variance analysis' },
        { label: 'Valuation', description: 'Calculate inventory value using FIFO, LIFO, or weighted average' }
      ]}
      moduleMappings={[
        {
          module: 'Inventory',
          forms: ['Item Master', 'Location Master', 'Item Classification', 'Supplier Item'],
          impact: 'Core inventory data management'
        },
        {
          module: 'Warehouse',
          forms: ['Goods Receipt', 'Issuance', 'Transfer', 'Cycle Count'],
          impact: 'Receipt and issuance transactions'
        },
        {
          module: 'Quality',
          forms: ['Incoming QC', 'Inspection', 'Disposition', 'Hold'],
          impact: 'Quality control and acceptance'
        },
        {
          module: 'Finance',
          forms: ['Inventory Valuation', 'COGS', 'Reserve', 'Obsolescence'],
          impact: 'Inventory accounting and valuation'
        }
      ]}
      keyBenefits={[
        'Inventory accuracy improved from 92% to 98%+',
        'Inventory carrying costs reduced by 15-20%',
        'Stockout prevention through automated reorder points',
        'Real-time inventory visibility across all locations',
        'Automated cycle counting eliminating annual shutdown',
        'Improved cash flow with optimized inventory levels'
      ]}
      glAccounts={['GL-1200', 'GL-1300', 'GL-1400', 'GL-5000']}
    />
  );
}
