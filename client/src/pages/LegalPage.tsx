import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { Scale, FileText, Shield, AlertCircle, Globe, Mail } from "lucide-react";

export default function LegalPage() {
  useEffect(() => {
    document.title = "Legal | NexusAI ERP";
  }, []);

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-16 text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-slate-600 text-white" data-testid="badge-legal">LEGAL</Badge>
          <h1 className="text-5xl font-bold mb-6" data-testid="text-page-title">Legal Information</h1>
          <p className="text-xl text-muted-foreground">
            Important legal information about NexusAI ERP, including licensing, terms, and policies.
          </p>
        </section>

        {/* Quick Links */}
        <section className="px-4 py-12 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/license">
                <Card className="p-6 h-full hover-elevate cursor-pointer" data-testid="card-license">
                  <Scale className="w-8 h-8 mb-4 text-blue-500" />
                  <h3 className="font-bold text-lg mb-2">License</h3>
                  <p className="text-sm text-muted-foreground">View the AGPL-3.0 open source license</p>
                </Card>
              </Link>
              <Link to="/security">
                <Card className="p-6 h-full hover-elevate cursor-pointer" data-testid="card-security">
                  <Shield className="w-8 h-8 mb-4 text-green-500" />
                  <h3 className="font-bold text-lg mb-2">Security Policy</h3>
                  <p className="text-sm text-muted-foreground">How we handle security vulnerabilities</p>
                </Card>
              </Link>
              <Link to="/docs/contributing">
                <Card className="p-6 h-full hover-elevate cursor-pointer" data-testid="card-contributing">
                  <FileText className="w-8 h-8 mb-4 text-purple-500" />
                  <h3 className="font-bold text-lg mb-2">Contributing</h3>
                  <p className="text-sm text-muted-foreground">Guidelines for contributors</p>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Terms of Use */}
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Terms of Use</h2>
          <div className="space-y-6 text-muted-foreground">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3 text-foreground">1. Acceptance of Terms</h3>
              <p>
                By accessing and using NexusAI ERP, you accept and agree to be bound by the terms and 
                provisions of this agreement. NexusAI is open source software licensed under AGPL-3.0.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3 text-foreground">2. Open Source License</h3>
              <p>
                NexusAI ERP is distributed under the GNU Affero General Public License version 3.0 (AGPL-3.0). 
                You are free to use, modify, and distribute the software in accordance with this license.
                See our <Link to="/license" className="text-blue-500 hover:underline">License page</Link> for full details.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3 text-foreground">3. No Warranty</h3>
              <p>
                This software is provided "as is" without warranty of any kind, express or implied. 
                The entire risk as to the quality and performance of the software is with you.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3 text-foreground">4. Contributions</h3>
              <p>
                Contributions to NexusAI are governed by our contributor agreement. By submitting code, 
                you agree that your contributions will be licensed under the same AGPL-3.0 license.
              </p>
            </Card>
          </div>
        </section>

        {/* Privacy */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Privacy Notice</h2>
            <div className="space-y-6 text-muted-foreground">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Globe className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">Self-Hosted Solution</h3>
                    <p>
                      NexusAI ERP is designed to be self-hosted. When you run NexusAI on your own 
                      infrastructure, your data stays on your servers. We do not collect or have access 
                      to any of your business data.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">Demo Environment</h3>
                    <p>
                      If you use our demo environment, please note that it is for evaluation purposes only. 
                      Do not enter real business or personal data in the demo. Demo data may be periodically cleared.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Trademark */}
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Trademark</h2>
          <Card className="p-6">
            <p className="text-muted-foreground">
              "NexusAI" and the NexusAI logo are trademarks of the NexusAI project. 
              Use of these trademarks is subject to our trademark guidelines. You may use the 
              NexusAI name to accurately refer to the software, but you may not use the trademark 
              in a way that suggests endorsement or affiliation without permission.
            </p>
          </Card>
        </section>

        {/* Contact */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Questions?</h2>
            <p className="text-muted-foreground mb-6">
              For legal inquiries, please open an issue on our GitHub repository.
            </p>
            <a 
              href="https://github.com/mbilaljunaid/nexusai-erp/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-500 hover:underline"
              data-testid="link-github-issues"
            >
              <FileText className="w-5 h-5" />
              Open an Issue on GitHub
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
