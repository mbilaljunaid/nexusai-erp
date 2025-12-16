import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { 
  ArrowRight, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  Factory, 
  Truck, 
  ClipboardCheck,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  Layers,
  CheckCircle,
  ExternalLink
} from "lucide-react";

export default function ProcessFlowsPage() {
  useEffect(() => {
    document.title = "Process Flows | NexusAIFirst ERP Documentation";
  }, []);

  const coreProcesses = [
    { icon: ShoppingCart, title: "Procure-to-Pay (P2P)", desc: "End-to-end procurement from requisition to payment", steps: 8, href: "/public/processes/procure-to-pay" },
    { icon: Package, title: "Order-to-Cash (O2C)", desc: "Complete sales cycle from order to revenue recognition", steps: 10, href: "/public/processes/order-to-cash" },
    { icon: Users, title: "Hire-to-Retire (H2R)", desc: "Full employee lifecycle management", steps: 12, href: "/public/processes/hire-to-retire" },
    { icon: DollarSign, title: "Record-to-Report (R2R)", desc: "Financial close and reporting processes", steps: 9, href: "/public/processes/month-end-consolidation" },
    { icon: Factory, title: "Plan-to-Produce", desc: "Manufacturing planning and execution", steps: 7, href: "/public/processes/production-planning" },
    { icon: Truck, title: "Inventory Management", desc: "Stock control and warehouse operations", steps: 6, href: "/public/processes/inventory-management" },
  ];

  const additionalProcesses = [
    { title: "Budget Planning", icon: BarChart3, href: "/public/processes/budget-planning" },
    { title: "Fixed Assets", icon: Layers, href: "/public/processes/fixed-asset-lifecycle" },
    { title: "Quality Management", icon: ClipboardCheck, href: "/public/processes/quality-assurance" },
    { title: "Contract Management", icon: FileText, href: "/public/processes/contract-management" },
    { title: "Demand Planning", icon: Calendar, href: "/public/processes/demand-planning" },
    { title: "Vendor Performance", icon: Settings, href: "/public/processes/vendor-performance" },
  ];

  const processCategories = [
    { category: "Finance", count: 6, color: "bg-green-500" },
    { category: "Supply Chain", count: 5, color: "bg-blue-500" },
    { category: "Manufacturing", count: 4, color: "bg-purple-500" },
    { category: "HR", count: 3, color: "bg-orange-500" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-16 text-center max-w-5xl mx-auto">
          <Badge className="mb-4 bg-purple-600 text-white" data-testid="badge-process-flows">PROCESS DOCUMENTATION</Badge>
          <h1 className="text-5xl font-bold mb-6" data-testid="text-page-title">Process Flows</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Explore NexusAIFirst's 18 end-to-end business processes designed to streamline 
            your enterprise operations across all departments.
          </p>
          <Link to="/public/processes">
            <Button size="lg" data-testid="button-view-all-processes">
              View All Processes <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </section>

        {/* Process Stats */}
        <section className="px-4 py-12 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <Card className="p-6" data-testid="stat-processes">
                <div className="text-4xl font-bold text-blue-500 mb-2">18</div>
                <div className="text-muted-foreground">E2E Processes</div>
              </Card>
              <Card className="p-6" data-testid="stat-forms">
                <div className="text-4xl font-bold text-green-500 mb-2">812</div>
                <div className="text-muted-foreground">Forms</div>
              </Card>
              <Card className="p-6" data-testid="stat-workflows">
                <div className="text-4xl font-bold text-purple-500 mb-2">100+</div>
                <div className="text-muted-foreground">Workflows</div>
              </Card>
              <Card className="p-6" data-testid="stat-automations">
                <div className="text-4xl font-bold text-orange-500 mb-2">50+</div>
                <div className="text-muted-foreground">Automations</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Processes */}
        <section className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Core Business Processes</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our flagship end-to-end processes cover the complete business lifecycle
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreProcesses.map((process, i) => {
              const IconComponent = process.icon;
              return (
                <Link key={i} to={process.href}>
                  <Card className="p-6 h-full hover-elevate cursor-pointer" data-testid={`card-process-${i}`}>
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className="w-10 h-10 text-blue-500" />
                      <Badge variant="secondary">{process.steps} steps</Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{process.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{process.desc}</p>
                    <div className="flex items-center text-sm text-blue-500">
                      View Process <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Additional Processes */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Additional Processes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {additionalProcesses.map((process, i) => {
                const IconComponent = process.icon;
                return (
                  <Link key={i} to={process.href}>
                    <Card className="p-4 text-center hover-elevate cursor-pointer" data-testid={`card-additional-${i}`}>
                      <IconComponent className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                      <h3 className="font-semibold text-sm">{process.title}</h3>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Process Categories */}
        <section className="px-4 py-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Processes by Category</h2>
          <div className="space-y-4">
            {processCategories.map((cat, i) => (
              <Card key={i} className="p-4" data-testid={`card-category-${i}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    <span className="font-semibold">{cat.category}</span>
                  </div>
                  <Badge variant="outline">{cat.count} processes</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Process Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <CheckCircle className="w-10 h-10 mx-auto mb-4 text-green-500" />
                <h3 className="font-bold text-lg mb-2">Automated Workflows</h3>
                <p className="text-sm text-muted-foreground">
                  Rule-based automation for approvals, notifications, and task routing
                </p>
              </Card>
              <Card className="p-6 text-center">
                <Settings className="w-10 h-10 mx-auto mb-4 text-blue-500" />
                <h3 className="font-bold text-lg mb-2">Configurable Steps</h3>
                <p className="text-sm text-muted-foreground">
                  Customize process flows to match your organization's requirements
                </p>
              </Card>
              <Card className="p-6 text-center">
                <BarChart3 className="w-10 h-10 mx-auto mb-4 text-purple-500" />
                <h3 className="font-bold text-lg mb-2">Real-time Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor process performance with built-in dashboards and KPIs
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <Layers className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Explore All Processes</h2>
            <p className="text-lg text-white/80 mb-8">
              Visit our Process Hub for detailed documentation and interactive flowcharts.
            </p>
            <Link to="/public/processes">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100" data-testid="button-process-hub">
                Go to Process Hub <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
