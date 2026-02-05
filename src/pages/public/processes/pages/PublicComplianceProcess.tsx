import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { Shield, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";

export default function PublicComplianceProcess() {
  useEffect(() => {
    document.title = "Compliance Management Process | NexusAIFirst ERP";
  }, []);

  const steps = [
    { step: 1, title: "Risk Assessment", desc: "Identify and evaluate compliance risks" },
    { step: 2, title: "Policy Management", desc: "Create and maintain compliance policies" },
    { step: 3, title: "Control Design", desc: "Implement internal controls and procedures" },
    { step: 4, title: "Training & Awareness", desc: "Educate employees on compliance requirements" },
    { step: 5, title: "Monitoring", desc: "Continuous compliance monitoring and testing" },
    { step: 6, title: "Incident Management", desc: "Track and resolve compliance violations" },
    { step: 7, title: "Audit Support", desc: "Prepare documentation for auditors" },
    { step: 8, title: "Reporting", desc: "Generate compliance dashboards and reports" },
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
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <Badge className="mb-2">GOVERNANCE</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">Compliance Management</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive compliance and governance framework with automated controls, 
            risk monitoring, and audit trail capabilities.
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
            <h2 className="text-3xl font-bold mb-4">Stay Compliant, Stay Confident</h2>
            <p className="text-muted-foreground mb-8">
              Reduce compliance risk with automated monitoring and reporting.
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
