import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { ShoppingCart, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";

export default function PublicProcureToPayProcess() {
  useEffect(() => {
    document.title = "Procure-to-Pay Process | NexusAIFirst ERP";
  }, []);

  const steps = [
    { step: 1, title: "Purchase Requisition", desc: "Create and submit purchase requests" },
    { step: 2, title: "Approval Workflow", desc: "Route for departmental approvals" },
    { step: 3, title: "Purchase Order", desc: "Generate and send PO to vendor" },
    { step: 4, title: "Goods Receipt", desc: "Receive and inspect delivered items" },
    { step: 5, title: "Invoice Matching", desc: "3-way match: PO, receipt, invoice" },
    { step: 6, title: "Payment Processing", desc: "Schedule and execute payment" },
    { step: 7, title: "GL Posting", desc: "Record transactions in general ledger" },
    { step: 8, title: "Reporting", desc: "Generate procurement analytics" },
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
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <Badge className="mb-2">PROCUREMENT</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">Procure-to-Pay (P2P)</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            End-to-end procurement process from purchase requisition to vendor payment, 
            with full automation and compliance controls.
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
            <h2 className="text-3xl font-bold mb-4">Automate Your Procurement</h2>
            <p className="text-muted-foreground mb-8">
              Reduce manual effort and improve compliance with automated P2P workflows.
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
