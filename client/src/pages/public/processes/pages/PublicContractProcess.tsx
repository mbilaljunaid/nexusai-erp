import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { FileText, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";

export default function PublicContractProcess() {
  useEffect(() => {
    document.title = "Contract Lifecycle Management | NexusAIFirst ERP";
  }, []);

  const steps = [
    { step: 1, title: "Contract Request", desc: "Initiate new contract requirements" },
    { step: 2, title: "Template Selection", desc: "Choose appropriate contract templates" },
    { step: 3, title: "Authoring", desc: "Draft and customize contract terms" },
    { step: 4, title: "Negotiation", desc: "Track redlines and version history" },
    { step: 5, title: "Approval Workflow", desc: "Route for legal and business approval" },
    { step: 6, title: "Execution", desc: "Capture signatures and finalize" },
    { step: 7, title: "Obligation Management", desc: "Track deliverables and milestones" },
    { step: 8, title: "Renewal & Expiry", desc: "Monitor contract lifecycle events" },
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
            <div className="p-3 rounded-lg bg-violet-100 dark:bg-violet-900">
              <FileText className="w-8 h-8 text-violet-600" />
            </div>
            <div>
              <Badge className="mb-2">LEGAL</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">Contract Lifecycle Management</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            End-to-end contract management from creation to renewal, 
            with automated workflows and obligation tracking.
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
            <h2 className="text-3xl font-bold mb-4">Manage Contracts Effectively</h2>
            <p className="text-muted-foreground mb-8">
              Reduce risk and improve compliance with centralized contract management.
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
