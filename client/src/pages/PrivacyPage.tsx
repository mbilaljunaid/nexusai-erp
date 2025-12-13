import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  useEffect(() => {
    document.title = "Privacy Policy | NexusAI ERP Platform";
  }, []);

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="public-hero px-4 py-16 text-center max-w-4xl mx-auto">
          <Shield className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h1 className="public-hero-title text-5xl font-bold mb-4" data-testid="text-privacy-title">Privacy Policy</h1>
          <p className="public-hero-subtitle text-xl text-muted-foreground">
            Your privacy is important to us. This policy explains how we handle your data.
          </p>
        </section>

        <section className="px-4 py-12 max-w-4xl mx-auto">
          <Card className="p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                NexusAI ERP is an open source project. When you use our demo or contact us, we may collect:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Contact information (name, email) when you submit forms</li>
                <li>Company information for demo requests</li>
                <li>Usage analytics to improve the platform</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use collected information to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Respond to your inquiries and support requests</li>
                <li>Provide demo access and implementation services</li>
                <li>Improve our open source software</li>
                <li>Send relevant updates about NexusAI (with your consent)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your data. 
                As an open source project, our security practices are transparent and 
                can be reviewed in our public repository.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">4. Self-Hosted Instances</h2>
              <p className="text-muted-foreground">
                If you self-host NexusAI ERP, you are responsible for your own data privacy 
                and security. The software does not send data to external servers unless 
                you configure it to do so.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>
              <p className="text-muted-foreground">
                Our website may use third-party services for analytics and payment processing. 
                These services have their own privacy policies governing the use of your information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground">
                For privacy-related inquiries, please contact us through our Contact page 
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
