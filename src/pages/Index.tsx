import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brain, BarChart3, Users, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">NexusAIFirst</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">Pricing</Button>
            <Button variant="ghost">About</Button>
            <Button>Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          AI-First Business
          <span className="block text-primary">Management Platform</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          NexusAIFirst combines CRM, Project Management, and AI-powered insights 
          into one intelligent platform. Automate workflows, score leads, and get 
          predictive analytics.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" className="gap-2">
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Everything You Need to Scale
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <Users className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>CRM</CardTitle>
              <CardDescription>
                Manage leads, contacts, and accounts with AI-powered scoring
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <BarChart3 className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Real-time dashboards with predictive insights
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <Zap className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Automation</CardTitle>
              <CardDescription>
                AI-driven workflow automation and task management
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <Brain className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>AI Copilot</CardTitle>
              <CardDescription>
                Intelligent assistant for decision support
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <h2 className="text-3xl font-bold">Ready to Transform Your Business?</h2>
            <p className="mt-4 max-w-xl text-primary-foreground/80">
              Join thousands of companies using NexusAIFirst to streamline operations 
              and boost productivity with AI.
            </p>
            <Button size="lg" variant="secondary" className="mt-8">
              Start Your Free Trial
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-semibold">NexusAIFirst</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 NexusAIFirst. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
