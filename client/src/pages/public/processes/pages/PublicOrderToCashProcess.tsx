import { Header, Footer } from "@/components/Navigation";
import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export default function PublicOrderToCashProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Order-to-Cash"
      processCode="P002"
      criticality="CRITICAL"
      category="Sales"
      cycletime="30 days"
      description="Complete sales cycle from lead management through revenue recognition and payment collection"
      flowSteps={[
        { label: 'Lead', description: 'Sales team captures lead from marketing or inbound inquiry' },
        { label: 'Opportunity', description: 'Qualify and develop sales opportunity with probability' },
        { label: 'Quote', description: 'Generate and send sales quote with pricing and terms' },
        { label: 'Order', description: 'Customer places order, credit check performed' },
        { label: 'Shipment', description: 'Goods picked, packed, shipped, and tracked' },
        { label: 'Invoice', description: 'Invoice generated and sent to customer' },
        { label: 'Payment', description: 'Customer payment received and applied' }
      ]}
      moduleMappings={[
        {
          module: 'CRM',
          forms: ['Lead', 'Opportunity', 'Account', 'Contact', 'Activity'],
          impact: 'Customer relationship tracking from initial contact to close'
        },
        {
          module: 'Sales',
          forms: ['Quote', 'Sales Order', 'Order Line Item', 'Discount Matrix'],
          impact: 'Quote-to-order conversion with pricing and discounts'
        },
        {
          module: 'Warehouse',
          forms: ['Pick List', 'Pack Slip', 'Shipment', 'Delivery Confirmation'],
          impact: 'Fulfillment and shipment with tracking'
        },
        {
          module: 'Finance',
          forms: ['Sales Invoice', 'Accounts Receivable', 'Payment', 'Revenue Recognition'],
          impact: 'Invoicing, collections, and revenue accounting'
        }
      ]}
      keyBenefits={[
        'Sales cycle time reduced by 30% through automation',
        '98%+ order accuracy with automated validation',
        'Real-time revenue visibility and forecasting',
        'Improved cash flow with automated AR management',
        'Enhanced customer service with order tracking',
        'ASC 606 compliant revenue recognition'
      ]}
      glAccounts={['GL-4000', 'GL-1100', 'GL-1000', 'GL-4100']}
    />
  );
}
