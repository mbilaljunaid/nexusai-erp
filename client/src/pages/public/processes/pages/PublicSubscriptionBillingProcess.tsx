import { Header, Footer } from "@/components/Navigation";
import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export default function PublicSubscriptionBillingProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Subscription Billing"
      processCode="P018"
      criticality="HIGH"
      category="Sales & Service"
      cycletime="Varies"
      description="Subscription management with periodic billing, payment collection, and revenue recognition"
      flowSteps={[
        { label: 'Order', description: 'Customer subscribes to plan with term and price' },
        { label: 'Activation', description: 'Service immediately activated and access provisioned' },
        { label: 'Billing', description: 'Invoice generated on schedule (monthly/annually)' },
        { label: 'Collection', description: 'Payment collected via credit card or transfer' },
        { label: 'Recognition', description: 'Revenue recognized monthly per ASC 606' },
        { label: 'Renewal', description: 'Renewal engagement or cancellation at term end' }
      ]}
      moduleMappings={[
        {
          module: 'Sales',
          forms: ['Subscription Plan', 'Subscription Order', 'Customer Subscription', 'Subscription Term'],
          impact: 'Subscription order and plan management'
        },
        {
          module: 'Billing',
          forms: ['Invoice Generation', 'Recurring Invoice', 'Billing Schedule', 'Payment Collection'],
          impact: 'Recurring billing and invoicing'
        },
        {
          module: 'Finance',
          forms: ['Deferred Revenue', 'Revenue Recognition', 'Subscription GL Entry', 'Churn Analysis'],
          impact: 'ASC 606 revenue accounting'
        },
        {
          module: 'Operations',
          forms: ['Service Activation', 'Service Provisioning', 'Churn Tracking', 'Renewal Notice'],
          impact: 'Service delivery and renewal management'
        }
      ]}
      keyBenefits={[
        'Monthly Recurring Revenue growing',
        'Churn rate reduced to 2.1%',
        'Customer Lifetime Value of $8,400+',
        'Invoice accuracy of 99.7%',
        'Payment collection rate of 98.2%',
        'Renewal rate of 94.3%'
      ]}
      glAccounts={['GL-1000', 'GL-1100', 'GL-2500', 'GL-4100']}
    />
  );
}
