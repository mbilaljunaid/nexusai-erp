import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Header, Footer } from "@/components/Navigation";

const processes = [
  { name: 'Procure-to-Pay', href: '/public/processes/procure-to-pay', category: 'Supply Chain' },
  { name: 'Order-to-Cash', href: '/public/processes/order-to-cash', category: 'Sales' },
  { name: 'Hire-to-Retire', href: '/public/processes/hire-to-retire', category: 'HR' },
  { name: 'Month-End Consolidation', href: '/public/processes/month-end-consolidation', category: 'Finance' },
  { name: 'Compliance & Risk', href: '/public/processes/compliance-risk', category: 'Governance' },
  { name: 'Inventory Management', href: '/public/processes/inventory-management', category: 'Operations' },
  { name: 'Fixed Asset Lifecycle', href: '/public/processes/fixed-asset-lifecycle', category: 'Finance' },
  { name: 'Production Planning', href: '/public/processes/production-planning', category: 'Manufacturing' },
  { name: 'Material Requirements Planning', href: '/public/processes/mrp', category: 'Manufacturing' },
  { name: 'Quality Assurance', href: '/public/processes/quality-assurance', category: 'Manufacturing' },
  { name: 'Contract Management', href: '/public/processes/contract-management', category: 'Finance' },
  { name: 'Budget Planning', href: '/public/processes/budget-planning', category: 'Finance' },
  { name: 'Demand Planning', href: '/public/processes/demand-planning', category: 'Supply Chain' },
  { name: 'Capacity Planning', href: '/public/processes/capacity-planning', category: 'Manufacturing' },
  { name: 'Warehouse Management', href: '/public/processes/warehouse-management', category: 'Operations' },
  { name: 'Customer Returns & RMA', href: '/public/processes/customer-returns', category: 'Sales' },
  { name: 'Vendor Performance', href: '/public/processes/vendor-performance', category: 'Procurement' },
  { name: 'Subscription Billing', href: '/public/processes/subscription-billing', category: 'Sales' }
];

export default function ProcessFlowsPage() {
  return (
    
      <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-4xl font-bold">End-to-End Process Flows</h1>
          </div>
          <p className="text-blue-100 text-lg">Explore all 18 critical business processes</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processes.map((process) => (
            <Link key={process.href} href={process.href}>
              <Card className="p-6 hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full">
                    {process.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{process.name}</h3>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
                  View Details <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
