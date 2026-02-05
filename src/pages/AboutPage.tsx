import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Github, Twitter, Scale, Heart, Users, Shield, Code2, GitFork, Star } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About NexusAIFirst | Open Source AI-Powered ERP Platform";
  }, []);

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
      {/* Hero */}
      <section className="public-hero px-4 py-20 text-center max-w-4xl mx-auto">
        <Badge className="mb-4 bg-green-600 text-white">OPEN SOURCE</Badge>
        <h1 className="public-hero-title text-5xl font-bold mb-6">About NexusAIFirst</h1>
        <p className="public-hero-subtitle text-xl">An open source, AI-powered enterprise platform built by the community, for the community. Licensed under AGPL-3.0.</p>
      </section>

      {/* Mission */}
      <section className="public-section-alt px-4 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="public-card p-6">
            <Scale className="w-8 h-8 mb-4 text-blue-500" />
            <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
            <p style={{ color: `hsl(var(--muted-foreground))` }}>Democratize enterprise software by making powerful ERP tools accessible to everyone through open source licensing.</p>
          </Card>
          <Card className="public-card p-6">
            <Code2 className="w-8 h-8 mb-4 text-green-500" />
            <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
            <p style={{ color: `hsl(var(--muted-foreground))` }}>To become the world's most trusted open source ERP platform, enabling companies of all sizes to operate efficiently across 40+ industries.</p>
          </Card>
          <Card className="public-card p-6">
            <Heart className="w-8 h-8 mb-4 text-red-500" />
            <h3 className="text-2xl font-bold mb-3">Our Values</h3>
            <p style={{ color: `hsl(var(--muted-foreground))` }}>Transparency, community collaboration, innovation, and the belief that enterprise software should be free and open.</p>
          </Card>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <Github className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">100% Open Source</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            NexusAIFirst is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). 
            You're free to use, modify, and distribute the software.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-700 border-slate-600 p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">812</div>
              <div className="text-slate-300">Forms</div>
            </Card>
            <Card className="bg-slate-700 border-slate-600 p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">18</div>
              <div className="text-slate-300">E2E Processes</div>
            </Card>
            <Card className="bg-slate-700 border-slate-600 p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">40+</div>
              <div className="text-slate-300">Industries</div>
            </Card>
            <Card className="bg-slate-700 border-slate-600 p-6 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">12</div>
              <div className="text-slate-300">Core Modules</div>
            </Card>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" data-testid="button-github-about">
                <Star className="mr-2 w-5 h-5" /> Star on GitHub
              </Button>
            </a>
            <a href="https://github.com/mbilaljunaid/nexusai-erp/fork" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-fork-about">
                <GitFork className="mr-2 w-5 h-5" /> Fork Repository
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Why NexusAIFirst */}
      <section className="public-section px-4 py-20 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">Why Choose NexusAIFirst?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: "Open Source Freedom", desc: "Full source code access. Audit, modify, and deploy on your own infrastructure." },
            { title: "AI at Core", desc: "Real-time insights, predictive analytics, and intelligent automation powered by AI." },
            { title: "40+ Industries", desc: "Specialized modules for Automotive, Banking, Healthcare, Retail, and more." },
            { title: "Community Driven", desc: "Built and improved by a global community of developers and enterprises." },
            { title: "No Vendor Lock-in", desc: "Self-host anywhere. Your data stays under your control, always." },
            { title: "Enterprise Security", desc: "RBAC, encryption, audit logging, and security best practices built in." },
          ].map((item, i) => (
            <div key={i} className="public-accent-border border-l-4 pl-6">
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p style={{ color: `hsl(var(--muted-foreground))` }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community */}
      <section className="public-section-alt px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="w-12 h-12 mx-auto mb-6 text-blue-500" />
          <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Whether you're a developer, enterprise user, or just getting started, 
            there's a place for you in the NexusAIFirst community.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/docs/contributing">
              <Button size="lg" data-testid="button-contribute-about">
                <Heart className="mr-2 w-5 h-5" /> Start Contributing
              </Button>
            </Link>
            <Link to="/open-source">
              <Button size="lg" variant="outline" data-testid="button-learn-opensource">
                Learn About Open Source
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Connect With Us</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Github className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">GitHub</p>
                    <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      github.com/mbilaljunaid/nexusai-erp
                    </a>
                    <p className="text-muted-foreground text-sm mt-1">Star the repo, open issues, or submit pull requests</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <GitFork className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Contribute</p>
                    <Link to="/docs/contributing" className="text-blue-400 hover:underline">
                      View Contributing Guidelines
                    </Link>
                    <p className="text-muted-foreground text-sm mt-1">Learn how to contribute to NexusAIFirst</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Shield className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Security</p>
                    <Link to="/security" className="text-blue-400 hover:underline">
                      View Security Policy
                    </Link>
                    <p className="text-muted-foreground text-sm mt-1">Report vulnerabilities via GitHub Security Advisories</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a href="https://github.com/mbilaljunaid/nexusai-erp/issues" target="_blank" rel="noopener noreferrer" className="block p-3 rounded bg-muted hover:bg-muted/80 transition">
                  <p className="font-semibold">Report an Issue</p>
                  <p className="text-sm text-muted-foreground">Found a bug? Let us know on GitHub</p>
                </a>
                <a href="https://github.com/mbilaljunaid/nexusai-erp/discussions" target="_blank" rel="noopener noreferrer" className="block p-3 rounded bg-muted hover:bg-muted/80 transition">
                  <p className="font-semibold">Discussions</p>
                  <p className="text-sm text-muted-foreground">Ask questions and share ideas</p>
                </a>
                <a href="https://github.com/mbilaljunaid/nexusai-erp/releases" target="_blank" rel="noopener noreferrer" className="block p-3 rounded bg-muted hover:bg-muted/80 transition">
                  <p className="font-semibold">Releases</p>
                  <p className="text-sm text-muted-foreground">Download the latest version</p>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="px-4 py-16 text-center">
        <h3 className="text-2xl font-bold mb-8">Follow Us</h3>
        <div className="flex justify-center gap-8">
          <a href="#linkedin" className="text-muted-foreground hover:text-blue-400 transition" data-testid="link-linkedin"><Linkedin className="w-8 h-8" /></a>
          <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-400 transition" data-testid="link-github"><Github className="w-8 h-8" /></a>
          <a href="#twitter" className="text-muted-foreground hover:text-blue-400 transition" data-testid="link-twitter"><Twitter className="w-8 h-8" /></a>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
