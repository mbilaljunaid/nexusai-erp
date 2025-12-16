import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { Code2, ArrowLeft, Terminal, Key, Webhook, FileJson } from "lucide-react";

export default function TechnicalAPIReference() {
  useEffect(() => {
    document.title = "API Reference | NexusAIFirst ERP Technical Documentation";
  }, []);

  const apiCategories = [
    { icon: Key, title: "Authentication", desc: "OAuth 2.0, JWT tokens, API keys", endpoint: "/api/auth/*" },
    { icon: FileJson, title: "Core Entities", desc: "CRUD operations for business objects", endpoint: "/api/v1/*" },
    { icon: Webhook, title: "Webhooks", desc: "Event-driven integrations", endpoint: "/api/webhooks/*" },
    { icon: Terminal, title: "Batch Operations", desc: "Bulk data import/export", endpoint: "/api/batch/*" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="px-4 py-16 max-w-5xl mx-auto">
          <Link to="/docs/technical">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Technical Docs
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <Code2 className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <Badge className="mb-2">TECHNICAL</Badge>
              <h1 className="text-4xl font-bold" data-testid="text-page-title">API Reference</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Complete API documentation for integrating with NexusAIFirst ERP. 
            RESTful endpoints with OpenAPI 3.0 specifications.
          </p>
        </section>

        <section className="px-4 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">API Categories</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {apiCategories.map((item, index) => (
              <Card key={index} data-testid={`card-api-${index}`}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{item.desc}</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{item.endpoint}</code>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Quick Start</h2>
            <Card>
              <CardContent className="p-6">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`# Authenticate and get access token
curl -X POST https://api.nexusaifirst.cloud/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"client_id": "YOUR_ID", "client_secret": "YOUR_SECRET"}'

# Make an API request
curl https://api.nexusaifirst.cloud/v1/customers \\
  -H "Authorization: Bearer YOUR_TOKEN"`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
