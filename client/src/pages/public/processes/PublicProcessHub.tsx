import React from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, TrendingUp, ShoppingCart, Users } from 'lucide-react';
import { Header, Footer } from "@/components/Navigation";
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface ProcessCard {
  id: string;
  number: number;
  name: string;
  category: string;
  criticality: 'CRITICAL' | 'HIGH';
  cycleTime: string;
  description: string;
}

const processes: ProcessCard[] = [
  {
    id: 'procure-to-pay',
    number: 1,
    name: 'Procure-to-Pay',
    category: 'Supply Chain',
    criticality: 'CRITICAL',
    cycleTime: '15 days',
    description: 'Purchase requisition through payment'
  },
  {
    id: 'order-to-cash',
    number: 2,
    name: 'Order-to-Cash',
    category: 'Sales',
    criticality: 'CRITICAL',
    cycleTime: '30 days',
    description: 'Lead to revenue recognition'
  },
  {
    id: 'hire-to-retire',
    number: 3,
    name: 'Hire-to-Retire',
    category: 'HR',
    criticality: 'CRITICAL',
    cycleTime: '30 days',
    description: 'Job opening to payroll processing'
  },
  {
    id: 'month-end-consolidation',
    number: 4,
    name: 'Month-End Consolidation',
    category: 'Finance',
    criticality: 'CRITICAL',
    cycleTime: 'Monthly',
    description: 'GL reconciliation to financial statements'
  },
  {
    id: 'compliance-risk',
    number: 5,
    name: 'Compliance & Risk',
    category: 'Governance',
    criticality: 'CRITICAL',
    cycleTime: 'Monthly',
    description: 'Audit trail to risk assessment'
  },
  {
    id: 'inventory-management',
    number: 6,
    name: 'Inventory Management',
    category: 'Operations',
    criticality: 'HIGH',
    cycleTime: 'Daily',
    description: 'ItemMaster to inventory adjustments'
  },
  {
    id: 'fixed-asset-lifecycle',
    number: 7,
    name: 'Fixed Asset Lifecycle',
    category: 'Finance',
    criticality: 'HIGH',
    cycleTime: 'Lifecycle',
    description: 'Asset acquisition to disposal'
  },
  {
    id: 'production-planning',
    number: 8,
    name: 'Production Planning',
    category: 'Manufacturing',
    criticality: 'HIGH',
    cycleTime: 'Varies',
    description: 'Forecast to finished goods'
  },
  {
    id: 'mrp',
    number: 9,
    name: 'Material Requirements Planning',
    category: 'Manufacturing',
    criticality: 'HIGH',
    cycleTime: 'Weekly',
    description: 'MPS to planned orders'
  },
  {
    id: 'quality-assurance',
    number: 10,
    name: 'Quality Assurance',
    category: 'Manufacturing',
    criticality: 'CRITICAL',
    cycleTime: 'Ongoing',
    description: 'Incoming QC to corrective actions'
  },
  {
    id: 'contract-management',
    number: 11,
    name: 'Contract Management',
    category: 'Finance',
    criticality: 'HIGH',
    cycleTime: '18-30 days',
    description: 'Requirements to renewal'
  },
  {
    id: 'budget-planning',
    number: 12,
    name: 'Budget Planning',
    category: 'Finance',
    criticality: 'CRITICAL',
    cycleTime: 'Annual',
    description: 'Assumptions to budget approval'
  },
  {
    id: 'demand-planning',
    number: 13,
    name: 'Demand Planning',
    category: 'Supply Chain',
    criticality: 'HIGH',
    cycleTime: 'Monthly',
    description: 'Historical analysis to plan release'
  },
  {
    id: 'capacity-planning',
    number: 14,
    name: 'Capacity Planning',
    category: 'Manufacturing',
    criticality: 'HIGH',
    cycleTime: 'Quarterly',
    description: 'Demand assessment to monitoring'
  },
  {
    id: 'warehouse-management',
    number: 15,
    name: 'Warehouse Management',
    category: 'Operations',
    criticality: 'HIGH',
    cycleTime: 'Continuous',
    description: 'Receipt to shipment'
  },
  {
    id: 'customer-returns',
    number: 16,
    name: 'Customer Returns & RMA',
    category: 'Sales & Service',
    criticality: 'HIGH',
    cycleTime: '7 days',
    description: 'Return authorization to credit'
  },
  {
    id: 'vendor-performance',
    number: 17,
    name: 'Vendor Performance',
    category: 'Procurement',
    criticality: 'HIGH',
    cycleTime: 'Quarterly',
    description: 'Scorecard to improvement tracking'
  },
  {
    id: 'subscription-billing',
    number: 18,
    name: 'Subscription Billing',
    category: 'Sales & Service',
    criticality: 'HIGH',
    cycleTime: 'Varies',
    description: 'Order to renewal'
  }
];

export default function PublicProcessHub() {
  const [, navigate] = useLocation();

  const criticalProcesses = processes.filter(p => p.criticality === 'CRITICAL').length;
  const highProcesses = processes.filter(p => p.criticality === 'HIGH').length;

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Supply Chain': <ShoppingCart className="w-5 h-5" />,
      'Sales': <TrendingUp className="w-5 h-5" />,
      'HR': <Users className="w-5 h-5" />,
      'Finance': <Briefcase className="w-5 h-5" />,
      'Governance': <Briefcase className="w-5 h-5" />,
      'Operations': <Briefcase className="w-5 h-5" />,
      'Manufacturing': <Briefcase className="w-5 h-5" />,
      'Procurement': <ShoppingCart className="w-5 h-5" />,
      'Sales & Service': <TrendingUp className="w-5 h-5" />,
    };
    return icons[category] || <Briefcase className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <Breadcrumbs items={[{ label: 'Processes', path: '' }]} />
        </div>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-5xl font-bold mb-4">18 End-to-End ERP Processes</h1>
            <p className="text-xl text-blue-100 mb-6">
              Comprehensive enterprise resource planning covering all critical business cycles
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white/10 border-white/20 p-4 backdrop-blur">
                <div className="text-blue-100 text-sm">Total Processes</div>
                <div className="text-3xl font-bold text-white">18</div>
              </Card>
              <Card className="bg-white/10 border-white/20 p-4 backdrop-blur">
                <div className="text-blue-100 text-sm">Critical Processes</div>
                <div className="text-3xl font-bold text-white">{criticalProcesses}</div>
              </Card>
              <Card className="bg-white/10 border-white/20 p-4 backdrop-blur">
                <div className="text-blue-100 text-sm">High Priority</div>
                <div className="text-3xl font-bold text-white">{highProcesses}</div>
              </Card>
            </div>
          </div>
        </div>

        {/* Process Grid */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processes.map((process) => (
              <Card
                key={process.id}
                className="p-6 hover:shadow-lg transition-all cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                onClick={() => navigate(`/public/processes/${process.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(process.category)}
                    <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded">
                      P{String(process.number).padStart(3, '0')}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    process.criticality === 'CRITICAL' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {process.criticality}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2">{process.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{process.description}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">{process.category}</span>
                  <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">{process.cycleTime}</span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(`/public/processes/${process.id}`)}
                >
                  Learn More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-slate-100 dark:bg-slate-900 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Explore Enterprise ERP?</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Learn how NexusAI transforms your business with comprehensive process automation
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Sign Up for Demo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
