import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { Settings, ArrowLeft, CheckCircle, Server, Database, Shield, Users } from "lucide-react";

export default function ImplementationSystemSetup() {
  useEffect(() => {
    document.title = "System Setup Guide | NexusAI ERP Implementation";
  }, []);

  const setupSteps = [
    { icon: Server, title: "Environment Configuration", desc: "Configure servers, databases, and network settings" },
    { icon: Database, title: "Database Setup", desc: "Initialize schemas, run migrations, seed master data" },
    { icon: Shield, title: "Security Configuration", desc: "Set up authentication, roles, and access controls" },
    { icon: Users, title: "User Provisioning", desc: "Create users, assign roles, and configure permissions" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="px-4 py-16 max-w-5xl mx-auto">
          <Link to="/docs/implementation">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Implementation
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
              <Settings className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <Badge className="mb-2">IMPLEMENTATION</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">System Setup Guide</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Complete guide to setting up your NexusAI ERP environment, 
            from infrastructure configuration to user provisioning.
          </p>
        </section>

        <section className="px-4 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Setup Checklist</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {setupSteps.map((item, index) => (
              <Card key={index} data-testid={`card-setup-${index}`}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Prerequisites</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>PostgreSQL 14+ database server</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Node.js 18+ runtime environment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>SSL certificates for production deployment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>SMTP server for email notifications</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
