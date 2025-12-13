import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsPage() {
  useEffect(() => {
    document.title = "Terms of Service | NexusAI ERP Platform";
  }, []);

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="public-hero px-4 py-16 text-center max-w-4xl mx-auto">
          <FileText className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h1 className="public-hero-title text-5xl font-bold mb-4" data-testid="text-terms-title">Terms of Service</h1>
          <p className="public-hero-subtitle text-xl text-muted-foreground">
            Terms and conditions for using NexusAI ERP and related services.
          </p>
        </section>

        <section className="px-4 py-12 max-w-4xl mx-auto">
          <Card className="p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using NexusAI ERP, you agree to be bound by these Terms of Service. 
                If you disagree with any part of these terms, you may not access the service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">2. Open Source License</h2>
              <p className="text-muted-foreground mb-4">
                NexusAI ERP is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). 
                This means:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You are free to use, modify, and distribute the software</li>
                <li>If you modify and distribute the software, you must release your modifications under the same license</li>
                <li>If you run a modified version on a server, you must make the source code available to users</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">3. Use of Service</h2>
              <p className="text-muted-foreground mb-4">
                When using our demo or hosted services, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate information when registering</li>
                <li>Use the service for lawful purposes only</li>
                <li>Not attempt to disrupt or compromise the service</li>
                <li>Not use the service to store or transmit malicious code</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">4. Implementation Services</h2>
              <p className="text-muted-foreground">
                Professional implementation services are provided separately from the open source software. 
                These services are subject to individual service agreements and are not covered by 
                the AGPL-3.0 license.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">5. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
                INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
                PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
                HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, NexusAI and its contributors shall not be 
                liable for any indirect, incidental, special, consequential, or punitive damages 
                resulting from your use of or inability to use the service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">7. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be posted 
                on this page with an updated revision date. Continued use of the service after 
                changes constitutes acceptance of the new terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">8. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these terms, please contact us through our Contact page 
                or open an issue on our GitHub repository.
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Last updated: December 2025
              </p>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
