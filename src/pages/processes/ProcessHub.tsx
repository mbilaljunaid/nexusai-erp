import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Link } from 'wouter';

interface ProcessCard {
  id: string;
  number: number;
  name: string;
  category: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cycleTime: string;
  formsCount: number;
  glCount: number;
  status: 'Active';
}

const processes: ProcessCard[] = [
  {
    id: 'procure-to-pay',
    number: 1,
    name: 'Procure to Pay',
    category: 'Supply Chain',
    criticality: 'CRITICAL',
    cycleTime: '15 days',
    formsCount: 8,
    glCount: 4,
    status: 'Active'
  },
  {
    id: 'order-to-cash',
    number: 2,
    name: 'Order to Cash',
    category: 'Sales',
    criticality: 'CRITICAL',
    cycleTime: '30 days',
    formsCount: 8,
    glCount: 4,
    status: 'Active'
  },
  {
    id: 'hire-to-retire',
    number: 3,
    name: 'Hire to Retire',
    category: 'HR',
    criticality: 'CRITICAL',
    cycleTime: '30 days',
    formsCount: 7,
    glCount: 3,
    status: 'Active'
  },
  {
    id: 'month-end-consolidation',
    number: 4,
    name: 'Month-End Consolidation',
    category: 'Finance',
    criticality: 'CRITICAL',
    cycleTime: 'Monthly',
    formsCount: 6,
    glCount: 8,
    status: 'Active'
  },
  {
    id: 'compliance-risk',
    number: 5,
    name: 'Compliance & Risk',
    category: 'Governance',
    criticality: 'CRITICAL',
    cycleTime: 'Monthly',
    formsCount: 5,
    glCount: 7,
    status: 'Active'
  },
  {
    id: 'inventory-management',
    number: 6,
    name: 'Inventory Management',
    category: 'Operations',
    criticality: 'HIGH',
    cycleTime: 'Daily',
    formsCount: 8,
    glCount: 5,
    status: 'Active'
  },
  {
    id: 'fixed-asset-lifecycle',
    number: 7,
    name: 'Fixed Asset Lifecycle',
    category: 'Finance',
    criticality: 'HIGH',
    cycleTime: 'Lifecycle',
    formsCount: 7,
    glCount: 5,
    status: 'Active'
  },
  {
    id: 'production-planning',
    number: 8,
    name: 'Production Planning',
    category: 'Manufacturing',
    criticality: 'HIGH',
    cycleTime: 'Varies',
    formsCount: 10,
    glCount: 5,
    status: 'Active'
  },
  {
    id: 'mrp',
    number: 9,
    name: 'Material Requirements Planning',
    category: 'Manufacturing',
    criticality: 'HIGH',
    cycleTime: 'Weekly',
    formsCount: 6,
    glCount: 3,
    status: 'Active'
  },
  {
    id: 'quality-assurance',
    number: 10,
    name: 'Quality Assurance & Control',
    category: 'Manufacturing',
    criticality: 'CRITICAL',
    cycleTime: 'Ongoing',
    formsCount: 5,
    glCount: 3,
    status: 'Active'
  },
  {
    id: 'contract-management',
    number: 11,
    name: 'Contract Management',
    category: 'Finance',
    criticality: 'HIGH',
    cycleTime: '18-30 days',
    formsCount: 6,
    glCount: 2,
    status: 'Active'
  },
  {
    id: 'budget-planning',
    number: 12,
    name: 'Budget Planning & Variance',
    category: 'Finance',
    criticality: 'CRITICAL',
    cycleTime: 'Annual',
    formsCount: 6,
    glCount: 2,
    status: 'Active'
  },
  {
    id: 'demand-planning',
    number: 13,
    name: 'Demand Planning & Forecasting',
    category: 'Supply Chain',
    criticality: 'HIGH',
    cycleTime: 'Monthly',
    formsCount: 6,
    glCount: 2,
    status: 'Active'
  },
  {
    id: 'capacity-planning',
    number: 14,
    name: 'Capacity Planning',
    category: 'Manufacturing',
    criticality: 'HIGH',
    cycleTime: 'Quarterly',
    formsCount: 6,
    glCount: 3,
    status: 'Active'
  },
  {
    id: 'warehouse-management',
    number: 15,
    name: 'Warehouse Management',
    category: 'Operations',
    criticality: 'HIGH',
    cycleTime: 'Continuous',
    formsCount: 6,
    glCount: 3,
    status: 'Active'
  },
  {
    id: 'customer-returns',
    number: 16,
    name: 'Customer Returns & RMA',
    category: 'Sales & Service',
    criticality: 'HIGH',
    cycleTime: '7 days',
    formsCount: 6,
    glCount: 5,
    status: 'Active'
  },
  {
    id: 'vendor-performance',
    number: 17,
    name: 'Vendor Performance Management',
    category: 'Procurement',
    criticality: 'HIGH',
    cycleTime: 'Quarterly',
    formsCount: 6,
    glCount: 1,
    status: 'Active'
  },
  {
    id: 'subscription-billing',
    number: 18,
    name: 'Subscription Billing',
    category: 'Sales & Service',
    criticality: 'HIGH',
    cycleTime: 'Varies',
    formsCount: 6,
    glCount: 4,
    status: 'Active'
  }
];

const criticalityStyles = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800'
};

export default function ProcessHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCriticality, setSelectedCriticality] = useState<string | null>(null);

  const filteredProcesses = processes.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesCriticality = !selectedCriticality || p.criticality === selectedCriticality;
    return matchesSearch && matchesCategory && matchesCriticality;
  });

  const categories = Array.from(new Set(processes.map(p => p.category)));
  const criticalities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Processes Dashboard</h1>
        <p className="text-lg text-muted-foreground">All 18 End-to-End ERP Processes</p>
      </div>

      {/* System Overview */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-semibold text-foreground mb-4">System Overview</h2>
        <div className="grid grid-cols-6 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">18</div>
            <div className="text-sm text-muted-foreground">Processes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">812</div>
            <div className="text-sm text-muted-foreground">Forms</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">100+</div>
            <div className="text-sm text-muted-foreground">GL Accounts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">50+</div>
            <div className="text-sm text-muted-foreground">API Endpoints</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <div className="text-sm text-muted-foreground">On-Time Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">0.2%</div>
            <div className="text-sm text-muted-foreground">Error Rate</div>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 bg-background p-3 rounded-lg border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search processes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 focus-visible:ring-0"
            data-testid="input-search-processes"
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground py-2">Category:</span>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                data-testid={`filter-category-${cat}`}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground py-2">Criticality:</span>
            {criticalities.map(crit => (
              <Button
                key={crit}
                variant={selectedCriticality === crit ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCriticality(selectedCriticality === crit ? null : crit)}
                data-testid={`filter-criticality-${crit}`}
              >
                {crit}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Processes Grid */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Processes ({processes.length})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({processes.filter(p => p.criticality === 'CRITICAL').length})</TabsTrigger>
          <TabsTrigger value="high">High ({processes.filter(p => p.criticality === 'HIGH').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-3 gap-6 mt-6">
            {filteredProcesses.map(process => (
              <Link key={process.id} href={`/processes/${process.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full" data-testid={`process-card-${process.id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">#{process.number}</div>
                      <h3 className="text-lg font-semibold text-foreground">{process.name}</h3>
                    </div>
                    <Badge className={criticalityStyles[process.criticality]}>
                      {process.criticality}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{process.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cycle Time:</span>
                      <span className="font-medium">⏱ {process.cycleTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium text-green-600">✓ {process.status}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t text-sm">
                    <div>
                      <div className="text-muted-foreground">{process.formsCount} Forms</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{process.glCount} GL Accounts</div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="critical">
          <div className="grid grid-cols-3 gap-6 mt-6">
            {processes.filter(p => p.criticality === 'CRITICAL').map(process => (
              <Link key={process.id} href={`/processes/${process.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" data-testid={`process-card-${process.id}`}>
                  <h3 className="text-lg font-semibold text-foreground mb-2">#{process.number} {process.name}</h3>
                  <Badge className="mb-4 bg-red-100 text-red-800">CRITICAL</Badge>
                  <div className="text-sm text-muted-foreground">{process.category}</div>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="high">
          <div className="grid grid-cols-3 gap-6 mt-6">
            {processes.filter(p => p.criticality === 'HIGH').map(process => (
              <Link key={process.id} href={`/processes/${process.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" data-testid={`process-card-${process.id}`}>
                  <h3 className="text-lg font-semibold text-foreground mb-2">#{process.number} {process.name}</h3>
                  <Badge className="mb-4 bg-orange-100 text-orange-800">HIGH</Badge>
                  <div className="text-sm text-muted-foreground">{process.category}</div>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
