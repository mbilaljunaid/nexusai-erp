import { Header, Footer } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UseCases() {
  const useCases = [
    {
      title: "Digital Transformation",
      desc: "Modernize legacy systems with AI-powered enterprise solutions",
      icon: "🚀",
    },
    {
      title: "Revenue Growth",
      desc: "Accelerate sales with predictive analytics and CRM automation",
      icon: "📈",
    },
    {
      title: "Operational Efficiency",
      desc: "Automate workflows and reduce manual processes by 70%",
      icon: "⚙️",
    },
    {
      title: "Cost Optimization",
      desc: "Reduce ERP implementation costs by 50% with pre-built modules",
      icon: "💰",
    },
    {
      title: "Global Expansion",
      desc: "Multi-tenant, multi-currency support for international operations",
      icon: "🌍",
    },
    {
      title: "Compliance & Risk",
      desc: "Automated compliance tracking and audit trails for all operations",
      icon: "🔐",
    },
  ];

  return (
    <div className="landing-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="px-4 py-24 max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">Use Cases</h1>
          <p className="text-xl mb-12" style={{ color: `hsl(var(--muted-foreground))` }}>
            Discover how NexusAI solves real business challenges across industries
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <Card key={i} className="landing-card p-6">
                <p className="text-3xl mb-4">{useCase.icon}</p>
                <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                <p style={{ color: `hsl(var(--muted-foreground))` }}>{useCase.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
