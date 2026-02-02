import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Warehouse,
  RotateCcw,
  Target,
  CreditCard
} from "lucide-react";

export default function PublicProcessHub() {
  useEffect(() => {
    document.title = "Business Processes | NexusAIFirst ERP";
  }, []);

  const processes = [
    { icon: ShoppingCart, title: "Procure-to-Pay", desc: "End-to-end procurement process", href: "/public/processes/procure-to-pay", color: "text-blue-500" },
    { icon: Package, title: "Order-to-Cash", desc: "Complete sales cycle management", href: "/public/processes/order-to-cash", color: "text-green-500" },
    { icon: Users, title: "Hire-to-Retire", desc: "Employee lifecycle management", href: "/public/processes/hire-to-retire", color: "text-purple-500" },
    { icon: DollarSign, title: "Month-End Consolidation", desc: "Financial close and reporting", href: "/public/processes/month-end-consolidation", color: "text-yellow-500" },
    { icon: ClipboardCheck, title: "Compliance & Risk", desc: "Regulatory compliance management", href: "/public/processes/compliance-risk", color: "text-red-500" },
    { icon: Layers, title: "Inventory Management", desc: "Stock control and optimization", href: "/public/processes/inventory-management", color: "text-cyan-500" },
    { icon: Settings, title: "Fixed Asset Lifecycle", desc: "Asset tracking and depreciation", href: "/public/processes/fixed-asset-lifecycle", color: "text-orange-500" },
    { icon: Factory, title: "Production Planning", desc: "Manufacturing scheduling", href: "/public/processes/production-planning", color: "text-indigo-500" },
    { icon: BarChart3, title: "MRP", desc: "Material requirements planning", href: "/public/processes/mrp", color: "text-pink-500" },
    { icon: Target, title: "Quality Assurance", desc: "Quality control processes", href: "/public/processes/quality-assurance", color: "text-teal-500" },
    { icon: FileText, title: "Contract Management", desc: "Contract lifecycle management", href: "/public/processes/contract-management", color: "text-lime-500" },
    { icon: Calendar, title: "Budget Planning", desc: "Budget creation and tracking", href: "/public/processes/budget-planning", color: "text-amber-500" },
    { icon: Truck, title: "Demand Planning", desc: "Demand forecasting", href: "/public/processes/demand-planning", color: "text-emerald-500" },
    { icon: Settings, title: "Capacity Planning", desc: "Resource capacity management", href: "/public/processes/capacity-planning", color: "text-violet-500" },
    { icon: Warehouse, title: "Warehouse Management", desc: "Warehouse operations", href: "/public/processes/warehouse-management", color: "text-rose-500" },
    { icon: RotateCcw, title: "Customer Returns", desc: "Returns and refunds processing", href: "/public/processes/customer-returns", color: "text-sky-500" },
    { icon: Users, title: "Vendor Performance", desc: "Supplier evaluation", href: "/public/processes/vendor-performance", color: "text-fuchsia-500" },
    { icon: CreditCard, title: "Subscription Billing", desc: "Recurring billing management", href: "/public/processes/subscription-billing", color: "text-slate-500" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="px-4 py-16 text-center max-w-5xl mx-auto">
          <Badge className="mb-4 bg-blue-600 text-white" data-testid="badge-process-hub">18 END-TO-END PROCESSES</Badge>
          <h1 className="text-5xl font-bold mb-6" data-testid="text-page-title">Business Process Hub</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Explore NexusAIFirst's comprehensive suite of enterprise business processes designed to 
            streamline operations across finance, supply chain, HR, and manufacturing.
          </p>
        </section>

        <section className="px-4 pb-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processes.map((process) => (
              <Link key={process.href} to={process.href}>
                <Card className="h-full hover:shadow-lg hover:border-primary transition-all cursor-pointer" data-testid={`card-process-${process.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <process.icon className={`w-5 h-5 ${process.color}`} />
                      </div>
                      <CardTitle className="text-lg">{process.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{process.desc}</p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      Learn More <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Operations?</h2>
            <p className="text-muted-foreground mb-8">
              See how NexusAIFirst can automate and optimize your business processes.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/demo">
                <Button size="lg" data-testid="button-request-demo">Request Demo</Button>
              </Link>
              <Link to="/docs/process-flows">
                <Button size="lg" variant="outline" data-testid="button-view-docs">View Documentation</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
