import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { GraduationCap, ArrowLeft, Package, Warehouse, Truck, ClipboardList, BarChart3, Settings } from "lucide-react";

export default function TrainingGuideInventory() {
  useEffect(() => {
    document.title = "Inventory Training Guide | NexusAI ERP";
  }, []);

  const modules = [
    { icon: Package, title: "Stock Management", desc: "Item master, stock levels, and reorder points", duration: "40 min" },
    { icon: Warehouse, title: "Warehouse Operations", desc: "Receiving, put-away, picking, and shipping", duration: "50 min" },
    { icon: Truck, title: "Goods Movement", desc: "Transfers, adjustments, and cycle counts", duration: "35 min" },
    { icon: ClipboardList, title: "Inventory Valuation", desc: "Costing methods, valuation reports", duration: "30 min" },
    { icon: BarChart3, title: "Inventory Analytics", desc: "Turnover, aging, and optimization reports", duration: "25 min" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="px-4 py-16 max-w-5xl mx-auto">
          <Link to="/docs/training-guides">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Training Guides
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
              <GraduationCap className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <Badge className="mb-2">TRAINING</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">Inventory Training Guide</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Complete training program for the Inventory module covering stock management, 
            warehouse operations, and inventory analytics.
          </p>
        </section>

        <section className="px-4 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Training Modules</h2>
          <div className="space-y-4">
            {modules.map((item, index) => (
              <Card key={index} data-testid={`card-module-${index}`}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Badge variant="outline">{item.duration}</Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Total training time: approximately 3 hours
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" data-testid="button-start-training">
                Start Training
              </Button>
              <Link to="/docs/training-guides">
                <Button size="lg" variant="outline" data-testid="button-view-all">
                  View All Guides
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
