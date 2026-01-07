import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { Building2, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";

export default function PublicFixedAssetProcess() {
  useEffect(() => {
    document.title = "Fixed Asset Management Process | NexusAIFirst ERP";
  }, []);

  const steps = [
    { step: 1, title: "Asset Acquisition", desc: "Record asset purchases and capitalization" },
    { step: 2, title: "Asset Classification", desc: "Categorize by type and depreciation method" },
    { step: 3, title: "Depreciation", desc: "Calculate and post periodic depreciation" },
    { step: 4, title: "Physical Tracking", desc: "Tag and track asset locations" },
    { step: 5, title: "Maintenance", desc: "Schedule and record asset maintenance" },
    { step: 6, title: "Transfers", desc: "Move assets between locations or entities" },
    { step: 7, title: "Disposal", desc: "Process asset sales, retirements, and write-offs" },
    { step: 8, title: "Reporting", desc: "Generate asset registers and tax reports" },
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
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Building2 className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <Badge className="mb-2">FINANCE</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">Fixed Asset Management</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Complete fixed asset lifecycle management with automated depreciation, 
            physical tracking, and compliance reporting.
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
            <h2 className="text-3xl font-bold mb-4">Maximize Asset Value</h2>
            <p className="text-muted-foreground mb-8">
              Track every asset from acquisition to disposal with full audit trail.
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
