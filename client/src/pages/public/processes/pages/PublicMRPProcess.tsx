import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { Calculator, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";

export default function PublicMRPProcess() {
  useEffect(() => {
    document.title = "Material Requirements Planning (MRP) | NexusAI ERP";
  }, []);

  const steps = [
    { step: 1, title: "Master Production Schedule", desc: "Define production requirements by period" },
    { step: 2, title: "BOM Explosion", desc: "Calculate component requirements from assemblies" },
    { step: 3, title: "Inventory Analysis", desc: "Check on-hand and scheduled receipts" },
    { step: 4, title: "Net Requirements", desc: "Calculate gross to net requirements" },
    { step: 5, title: "Lead Time Offset", desc: "Schedule orders based on lead times" },
    { step: 6, title: "Planned Orders", desc: "Generate purchase and production orders" },
    { step: 7, title: "Order Firming", desc: "Convert planned to firm orders" },
    { step: 8, title: "Exception Management", desc: "Handle shortages and expedites" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="px-4 py-16 max-w-5xl mx-auto">
          <Link to="/public/processes">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Processes
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-900">
              <Calculator className="w-8 h-8 text-cyan-600" />
            </div>
            <div>
              <Badge className="mb-2">PLANNING</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">Material Requirements Planning</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Automated material planning to ensure the right materials are available 
            at the right time for production needs.
          </p>
        </section>

        <section className="px-4 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Process Steps</h2>
          <div className="space-y-4">
            {steps.map((item) => (
              <Card key={item.step} data-testid={`card-step-${item.step}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Optimize Material Planning</h2>
            <p className="text-muted-foreground mb-8">
              Reduce stockouts and excess inventory with intelligent MRP.
            </p>
            <Link to="/demo">
              <Button size="lg" data-testid="button-request-demo">
                Request Demo <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
