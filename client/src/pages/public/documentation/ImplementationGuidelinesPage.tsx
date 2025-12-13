import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { 
  Rocket, 
  Settings, 
  Database, 
  Shield, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText,
  Server,
  Layers,
  Zap,
  ArrowRight,
  AlertTriangle,
  BookOpen
} from "lucide-react";

export default function ImplementationGuidelinesPage() {
  useEffect(() => {
    document.title = "Implementation Guidelines | NexusAI ERP Documentation";
  }, []);

  const implementationPhases = [
    { phase: 1, title: "Discovery & Planning", duration: "2-4 weeks", tasks: ["Requirements gathering", "Gap analysis", "Project planning", "Team setup"] },
    { phase: 2, title: "System Configuration", duration: "4-6 weeks", tasks: ["Core module setup", "User roles & permissions", "Workflow configuration", "Integration setup"] },
    { phase: 3, title: "Data Migration", duration: "3-4 weeks", tasks: ["Data mapping", "Data cleansing", "Migration testing", "Data validation"] },
    { phase: 4, title: "Testing & Training", duration: "3-4 weeks", tasks: ["UAT testing", "User training", "Performance testing", "Security audit"] },
    { phase: 5, title: "Go-Live & Support", duration: "2-4 weeks", tasks: ["Production deployment", "Hypercare support", "Issue resolution", "Optimization"] },
  ];

  const quickStartSteps = [
    { icon: Server, title: "Environment Setup", desc: "Clone repo, install dependencies, configure database" },
    { icon: Database, title: "Database Migration", desc: "Run migrations to set up schema and seed data" },
    { icon: Settings, title: "Configuration", desc: "Set up environment variables and application settings" },
    { icon: Rocket, title: "Launch", desc: "Start the application and access the dashboard" },
  ];

  const prerequisites = [
    { title: "Node.js 18+", required: true },
    { title: "PostgreSQL 14+", required: true },
    { title: "Git", required: true },
    { title: "Docker (optional)", required: false },
    { title: "Redis (optional)", required: false },
  ];

  const bestPractices = [
    { icon: Shield, title: "Security First", desc: "Configure RBAC, enable encryption, set up audit logging" },
    { icon: Users, title: "Change Management", desc: "Prepare end-users through training and communication" },
    { icon: Layers, title: "Phased Rollout", desc: "Start with core modules before expanding functionality" },
    { icon: Zap, title: "Performance Tuning", desc: "Optimize database queries and enable caching" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-16 text-center max-w-5xl mx-auto">
          <Badge className="mb-4 bg-green-600 text-white" data-testid="badge-implementation">IMPLEMENTATION GUIDE</Badge>
          <h1 className="text-5xl font-bold mb-6" data-testid="text-page-title">Implementation Guidelines</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Step-by-step guidance for deploying NexusAI ERP in your organization. 
            From initial setup to full production deployment.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/docs/implementation/system-setup">
              <Button size="lg" data-testid="button-quick-start">
                <Rocket className="mr-2 w-5 h-5" /> Quick Start Guide
              </Button>
            </Link>
            <Button size="lg" variant="outline" data-testid="button-download-guide">
              <FileText className="mr-2 w-5 h-5" /> Download PDF Guide
            </Button>
          </div>
        </section>

        {/* Quick Start */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">Quick Start</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Get NexusAI running in minutes with these simple steps
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStartSteps.map((step, i) => {
                const IconComponent = step.icon;
                return (
                  <Card key={i} className="p-6 text-center" data-testid={`card-quickstart-${i}`}>
                    <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <IconComponent className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Prerequisites */}
        <section className="px-4 py-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Prerequisites</h2>
          <Card className="p-6">
            <div className="space-y-4">
              {prerequisites.map((prereq, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid={`prereq-${i}`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${prereq.required ? "text-green-500" : "text-muted-foreground"}`} />
                    <span>{prereq.title}</span>
                  </div>
                  <Badge variant={prereq.required ? "default" : "secondary"}>
                    {prereq.required ? "Required" : "Optional"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Implementation Phases */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">Enterprise Implementation Phases</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              A structured approach for large-scale deployments
            </p>
            <div className="space-y-6">
              {implementationPhases.map((phase, i) => (
                <Card key={i} className="p-6" data-testid={`card-phase-${i}`}>
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                        {phase.phase}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{phase.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" /> {phase.duration}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2">
                        {phase.tasks.map((task, j) => (
                          <Badge key={j} variant="secondary">{task}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bestPractices.map((practice, i) => {
              const IconComponent = practice.icon;
              return (
                <Card key={i} className="p-6" data-testid={`card-practice-${i}`}>
                  <div className="flex items-start gap-4">
                    <IconComponent className="w-8 h-8 text-green-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">{practice.title}</h3>
                      <p className="text-sm text-muted-foreground">{practice.desc}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Warning */}
        <section className="px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 border-yellow-500/50 bg-yellow-500/5">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Important Considerations</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Always back up your data before major configuration changes</li>
                    <li>Test thoroughly in a staging environment before production deployment</li>
                    <li>Plan for adequate user training and change management</li>
                    <li>Consider engaging professional services for complex implementations</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 bg-gradient-to-br from-green-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <Rocket className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ready to Deploy?</h2>
            <p className="text-lg text-white/80 mb-8">
              Follow our step-by-step system setup guide to get started.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/docs/implementation/system-setup">
                <Button size="lg" className="bg-white text-green-600 hover:bg-slate-100" data-testid="button-system-setup">
                  System Setup Guide <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/docs/technical">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-tech-docs">
                  <BookOpen className="mr-2 w-4 h-4" /> Technical Docs
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
