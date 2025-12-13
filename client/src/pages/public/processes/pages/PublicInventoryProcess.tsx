import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { Package, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";

export default function PublicInventoryProcess() {
  useEffect(() => {
    document.title = "Inventory Management Process | NexusAI ERP";
  }, []);

  const steps = [
    { step: 1, title: "Inventory Planning", desc: "Forecast demand and set stock levels" },
    { step: 2, title: "Goods Receipt", desc: "Receive and inspect incoming inventory" },
    { step: 3, title: "Put-away", desc: "Store items in optimal warehouse locations" },
    { step: 4, title: "Stock Management", desc: "Track quantities, lots, and serial numbers" },
    { step: 5, title: "Cycle Counting", desc: "Perform periodic inventory counts" },
    { step: 6, title: "Transfer Orders", desc: "Move inventory between locations" },
    { step: 7, title: "Goods Issue", desc: "Pick and ship items to fulfill orders" },
    { step: 8, title: "Valuation & Reporting", desc: "Calculate inventory value and analytics" },
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
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900">
              <Package className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <Badge className="mb-2">SUPPLY CHAIN</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">Inventory Management</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            End-to-end inventory control with real-time visibility, automated replenishment, 
            and accurate valuation across all locations.
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
            <h2 className="text-3xl font-bold mb-4">Optimize Your Inventory</h2>
            <p className="text-muted-foreground mb-8">
              Reduce carrying costs and stockouts with intelligent inventory management.
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
