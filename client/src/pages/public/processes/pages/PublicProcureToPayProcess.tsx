import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export function PublicProcureToPayProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Procure-to-Pay"
      processCode="P001"
      criticality="CRITICAL"
      category="Supply Chain"
      cycletime="15 days"
      description="Complete procurement cycle from purchase requisition through vendor invoice processing and payment"
      flowSteps={[
        { label: 'Requisition', description: 'Department submits purchase requisition with business justification' },
        { label: 'Approval', description: 'Manager and Finance Director approve spending authority' },
        { label: 'PO Creation', description: 'Purchase order issued to vendor with terms and delivery date' },
        { label: 'Goods Receipt', description: 'Goods received and inspected against purchase order' },
        { label: 'Invoice', description: 'Vendor invoice matched to PO and receipt (3-way match)' },
        { label: 'Payment', description: 'Invoice approved and payment processed via bank' }
      ]}
      moduleMappings={[
        {
          module: 'Procurement',
          forms: ['Purchase Requisition', 'Purchase Order', 'Vendor Master'],
          impact: 'Core purchasing with vendor management and order tracking'
        },
        {
          module: 'Inventory Management',
          forms: ['Goods Receipt', 'Quality Inspection', 'Inventory Adjustment'],
          impact: 'Receipt and quality control of purchased materials'
        },
        {
          module: 'Finance',
          forms: ['Vendor Invoice', 'Invoice Matching', 'Payment Authorization'],
          impact: 'Invoice processing with 3-way matching and payment controls'
        },
        {
          module: 'General Ledger',
          forms: ['GL Journal Entry', 'Accrual Entry', 'Payment Posting'],
          impact: 'Automatic GL postings for expense and liability recognition'
        }
      ]}
      keyBenefits={[
        'Reduced procurement cycle time from 20 days to 15 days',
        '99%+ invoice accuracy through automated 3-way matching',
        'Improved cash flow with optimized payment terms',
        'Enhanced vendor compliance and performance tracking',
        'Real-time purchase order visibility across organization',
        'Automated GL posting for financial accuracy'
      ]}
      glAccounts={['GL-5000', 'GL-2100', 'GL-1000', 'GL-1200']}
    />
  );
}
