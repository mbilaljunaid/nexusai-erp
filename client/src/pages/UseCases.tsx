import { Header, Footer } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, TrendingUp, Settings, DollarSign, Globe, Lock } from "lucide-react";

export default function UseCases() {
  const useCases = [
    {
      title: "Digital Transformation",
      desc: "Modernize legacy systems with AI-powered enterprise solutions",
      icon: Rocket,
    },
    {
      title: "Revenue Growth",
      desc: "Accelerate sales with predictive analytics and CRM automation",
      icon: TrendingUp,
    },
    {
      title: "Operational Efficiency",
      desc: "Automate workflows and reduce manual processes by 70%",
      icon: Settings,
    },
    {
      title: "Cost Optimization",
      desc: "Reduce ERP implementation costs by 50% with pre-built modules",
      icon: DollarSign,
    },
    {
      title: "Global Expansion",
      desc: "Multi-tenant, multi-currency support for international operations",
      icon: Globe,
    },
    {
      title: "Compliance & Risk",
      desc: "Automated compliance tracking and audit trails for all operations",
      icon: Lock,
    },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="public-hero px-4 py-24 max-w-7xl mx-auto">
          <h1 className="public-hero-title text-5xl font-bold mb-6">Use Cases</h1>
          <p className="public-hero-subtitle text-xl">
            Discover how NexusAI solves real business challenges across industries
          </p>
        </section>

        <section className="public-section px-4 py-20 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => {
              const UseCaseIcon = useCase.icon;
              return (
                <Card key={i} className="public-card p-6" data-testid={`card-usecase-${i}`}>
                  <UseCaseIcon className="w-8 h-8 mb-4" style={{ color: `hsl(var(--primary))` }} />
                  <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                  <p style={{ color: `hsl(var(--muted-foreground))` }}>{useCase.desc}</p>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
