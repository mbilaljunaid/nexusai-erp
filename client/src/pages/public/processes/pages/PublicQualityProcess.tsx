import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { ClipboardCheck, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";

export default function PublicQualityProcess() {
  useEffect(() => {
    document.title = "Quality Management Process | NexusAIFirst ERP";
  }, []);

  const steps = [
    { step: 1, title: "Quality Planning", desc: "Define quality standards and specifications" },
    { step: 2, title: "Inspection Plans", desc: "Create sampling and testing procedures" },
    { step: 3, title: "Incoming Inspection", desc: "Test raw materials and components" },
    { step: 4, title: "In-Process Inspection", desc: "Monitor quality during production" },
    { step: 5, title: "Final Inspection", desc: "Verify finished goods meet specifications" },
    { step: 6, title: "Non-Conformance", desc: "Document and manage quality issues" },
    { step: 7, title: "Corrective Action", desc: "Implement CAPA for root cause resolution" },
    { step: 8, title: "Quality Analytics", desc: "Track metrics and continuous improvement" },
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
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900">
              <ClipboardCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <Badge className="mb-2">QUALITY</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">Quality Management</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive quality management with inspection, non-conformance tracking, 
            and continuous improvement capabilities.
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
            <h2 className="text-3xl font-bold mb-4">Deliver Quality Excellence</h2>
            <p className="text-muted-foreground mb-8">
              Reduce defects and ensure compliance with integrated quality management.
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
