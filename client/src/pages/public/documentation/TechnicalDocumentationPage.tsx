import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { 
  Code2, 
  Database, 
  Server, 
  Shield, 
  Cpu, 
  Network, 
  FileCode, 
  BookOpen,
  ExternalLink,
  Layers,
  Lock,
  Zap
} from "lucide-react";

export default function TechnicalDocumentationPage() {
  useEffect(() => {
    document.title = "Technical Documentation | NexusAI ERP";
  }, []);

  const architectureComponents = [
    { icon: Server, title: "Backend Architecture", desc: "Node.js/Express with TypeScript, RESTful APIs, and WebSocket support" },
    { icon: Database, title: "Database Layer", desc: "PostgreSQL with Drizzle ORM for type-safe database operations" },
    { icon: Layers, title: "Frontend Stack", desc: "React with Vite, TanStack Query, and Tailwind CSS" },
    { icon: Shield, title: "Security Layer", desc: "RBAC, JWT authentication, and encrypted data at rest" },
  ];

  const apiCategories = [
    { title: "Authentication", endpoints: 8, desc: "User login, registration, session management" },
    { title: "CRM", endpoints: 15, desc: "Leads, contacts, opportunities, accounts" },
    { title: "Finance", endpoints: 20, desc: "Invoices, payments, GL entries, budgets" },
    { title: "HR & Payroll", endpoints: 18, desc: "Employees, payroll, leave, performance" },
    { title: "Inventory", endpoints: 12, desc: "Products, stock, warehouses, transfers" },
    { title: "Manufacturing", endpoints: 14, desc: "Work orders, BOM, production planning" },
  ];

  const techStack = [
    { category: "Frontend", items: ["React 18", "TypeScript", "Vite", "TanStack Query", "Tailwind CSS", "Shadcn/UI"] },
    { category: "Backend", items: ["Node.js", "Express", "TypeScript", "Drizzle ORM", "Zod Validation"] },
    { category: "Database", items: ["PostgreSQL", "Redis (caching)", "Full-text search"] },
    { category: "DevOps", items: ["Docker", "GitHub Actions", "Nix", "Replit Deployments"] },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-16 text-center max-w-5xl mx-auto">
          <Badge className="mb-4 bg-blue-600 text-white" data-testid="badge-technical">TECHNICAL DOCUMENTATION</Badge>
          <h1 className="text-5xl font-bold mb-6" data-testid="text-page-title">Technical Documentation</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Comprehensive technical reference for developers building with NexusAI ERP. 
            Explore our architecture, APIs, and integration guides.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/docs/technical/api-reference">
              <Button size="lg" data-testid="button-api-reference">
                <Code2 className="mr-2 w-5 h-5" /> API Reference
              </Button>
            </Link>
            <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" data-testid="button-github-docs">
                <FileCode className="mr-2 w-5 h-5" /> View Source Code
              </Button>
            </a>
          </div>
        </section>

        {/* Architecture Overview */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">System Architecture</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              NexusAI is built on a modern, scalable architecture designed for enterprise workloads.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {architectureComponents.map((component, i) => {
                const IconComponent = component.icon;
                return (
                  <Card key={i} className="p-6" data-testid={`card-architecture-${i}`}>
                    <IconComponent className="w-10 h-10 mb-4 text-blue-500" />
                    <h3 className="font-bold text-lg mb-2">{component.title}</h3>
                    <p className="text-sm text-muted-foreground">{component.desc}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((stack, i) => (
              <Card key={i} className="p-6" data-testid={`card-stack-${i}`}>
                <h3 className="font-bold text-lg mb-4">{stack.category}</h3>
                <ul className="space-y-2">
                  {stack.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="w-3 h-3 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* API Categories */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">API Endpoints</h2>
            <p className="text-center text-muted-foreground mb-12">
              Over 50+ RESTful API endpoints organized by module
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiCategories.map((category, i) => (
                <Card key={i} className="p-6" data-testid={`card-api-${i}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{category.title}</h3>
                    <Badge variant="secondary">{category.endpoints} endpoints</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{category.desc}</p>
                </Card>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link to="/docs/technical/api-reference">
                <Button size="lg" data-testid="button-full-api-docs">
                  View Full API Documentation <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="px-4 py-20 max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <Lock className="w-10 h-10 text-green-500 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Security & Compliance</h2>
                <p className="text-muted-foreground">
                  NexusAI implements enterprise-grade security measures to protect your data.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Role-Based Access Control (RBAC)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Lock className="w-5 h-5 text-blue-500" />
                <span className="text-sm">AES-256 Encryption at Rest</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Network className="w-5 h-5 text-blue-500" />
                <span className="text-sm">TLS 1.3 in Transit</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Cpu className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Full Audit Logging</span>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-white/80 mb-8">
              Explore our implementation guides and start building with NexusAI today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/docs/implementation">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100" data-testid="button-implementation">
                  Implementation Guide
                </Button>
              </Link>
              <Link to="/docs/contributing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-contribute-docs">
                  Contribute
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
