import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/Navigation";

interface IndustryDemoPageProps {
  industry: string;
}

export default function IndustryDemoPage({ industry }: IndustryDemoPageProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoLink, setDemoLink] = useState("");

  useEffect(() => {
    document.title = `${industry} Demo | NexusAI`;
  }, [industry]);

  const handleRequestDemo = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/demos/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company: industry, industry }),
      });

      if (res.ok) {
        const data = await res.json();
        const demoURL = `${window.location.origin}/demo-access/${data.id}`;
        setDemoLink(demoURL);
        setSubmitted(true);

        // Send credentials email
        await fetch("/api/demos/send-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            industry,
            demoLink: demoURL,
            username: `demo_${industry.toLowerCase().replace(/\s+/g, "_")}`,
            password: `Demo@${new Date().getFullYear()}`,
          }),
        });
      }
    } catch (e) {
      console.error(e);
      alert("Failed to request demo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-20 text-center border-b border-slate-700">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-500/50">
              {industry.toUpperCase()} DEMO
            </Badge>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Experience NexusAI for {industry}
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Explore a fully configured demo environment with pre-populated {industry.toLowerCase()} data
            </p>
          </div>
        </section>

        {/* Demo Content */}
        <section className="px-4 py-20">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Left: Features */}
            <div>
              <h2 className="text-3xl font-bold mb-8">What's Included</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white">Industry-Specific Data</h3>
                    <p className="text-slate-300 text-sm">Pre-populated with {industry} sample data</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white">All Core Modules</h3>
                    <p className="text-slate-300 text-sm">CRM, ERP, Finance, HR, Projects, Analytics</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white">Complete Guide</h3>
                    <p className="text-slate-300 text-sm">Step-by-step walkthrough included</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white">7-Day Access</h3>
                    <p className="text-slate-300 text-sm">Full access to explore all features</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Demo Form */}
            <div>
              <Card className="bg-slate-800/50 border-slate-700 p-8" data-testid="card-demo-request">
                {!submitted ? (
                  <>
                    <h3 className="text-2xl font-bold mb-6">Request Demo</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@company.com"
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                          data-testid="input-email"
                        />
                      </div>
                      <Button
                        onClick={handleRequestDemo}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        data-testid="button-request-demo"
                      >
                        {loading ? "Sending..." : "Request Demo"} <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      <p className="text-xs text-slate-400 text-center">
                        Credentials and access link will be sent to your email
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold mb-6 text-green-400">Demo Ready!</h3>
                    <p className="text-slate-300 mb-4">
                      Check your email at <span className="font-mono text-blue-400">{email}</span> for:
                    </p>
                    <ul className="space-y-2 text-slate-300 mb-6">
                      <li>✓ Demo login credentials</li>
                      <li>✓ Direct access link</li>
                      <li>✓ Complete walkthrough guide</li>
                    </ul>
                    <Link to="/industries">
                      <Button variant="outline" className="w-full text-white border-white hover:bg-white/10">
                        Back to Industries
                      </Button>
                    </Link>
                  </>
                )}
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 border-t border-slate-700">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your {industry} Business?</h2>
            <p className="text-slate-300 mb-8">
              Our experts can help you implement NexusAI for your specific needs
            </p>
            <Link to="/about">
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-contact-sales">
                Contact Sales <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
