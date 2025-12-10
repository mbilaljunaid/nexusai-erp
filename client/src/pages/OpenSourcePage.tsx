import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { 
  Github, 
  Scale, 
  Users, 
  Shield, 
  Heart, 
  GitFork, 
  Star, 
  BookOpen, 
  Code2, 
  FileText, 
  MessageSquare,
  ExternalLink,
  CheckCircle
} from "lucide-react";

export default function OpenSourcePage() {
  useEffect(() => {
    document.title = "Open Source | NexusAI - AGPL-3.0 Licensed ERP Platform";
  }, []);

  const licenseFeatures = [
    { title: "Free to Use", desc: "Deploy NexusAI for your organization at no cost" },
    { title: "View Source Code", desc: "Complete transparency - inspect every line of code" },
    { title: "Modify & Extend", desc: "Customize the platform to fit your exact needs" },
    { title: "Share Improvements", desc: "Contribute back and help the community grow" },
  ];

  const contributionAreas = [
    { icon: Code2, title: "Code Contributions", desc: "Submit pull requests for bug fixes, features, and improvements" },
    { icon: FileText, title: "Documentation", desc: "Help improve guides, API docs, and tutorials" },
    { icon: MessageSquare, title: "Community Support", desc: "Answer questions and help other users in discussions" },
    { icon: Shield, title: "Security Reports", desc: "Responsibly disclose vulnerabilities through our security process" },
  ];

  const resources = [
    { icon: Github, title: "GitHub Repository", desc: "Source code, issues, and pull requests", href: "https://github.com/mbilaljunaid/nexusai-erp" },
    { icon: BookOpen, title: "Contributing Guide", desc: "How to contribute to NexusAI", href: "/docs/contributing" },
    { icon: Scale, title: "License (AGPL-3.0)", desc: "Full license text and terms", href: "/license" },
    { icon: Shield, title: "Security Policy", desc: "How to report vulnerabilities", href: "/security" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-20 text-center max-w-5xl mx-auto">
          <Badge className="mb-4 bg-green-600 text-white">OPEN SOURCE</Badge>
          <h1 className="text-5xl font-bold mb-6">
            NexusAI is Open Source
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Built by the community, for the community. NexusAI is licensed under the 
            GNU Affero General Public License v3.0 (AGPL-3.0), ensuring freedom to use, 
            modify, and share.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-slate-800 hover:bg-slate-700 text-white" data-testid="button-github">
                <Github className="mr-2 w-5 h-5" /> View on GitHub
              </Button>
            </a>
            <Link to="/docs/contributing">
              <Button size="lg" variant="outline" data-testid="button-contribute">
                <Heart className="mr-2 w-5 h-5" /> Start Contributing
              </Button>
            </Link>
          </div>
        </section>

        {/* License Section */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Scale className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h2 className="text-4xl font-bold mb-4">AGPL-3.0 License</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The GNU Affero General Public License is a free, copyleft license that ensures 
                the software remains open source, even when used over a network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {licenseFeatures.map((feature, i) => (
                <Card key={i} className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Card className="inline-block p-6 bg-slate-800 text-white max-w-3xl">
                <p className="text-sm font-mono leading-relaxed">
                  NexusAI - AI-Powered Enterprise ERP Platform<br />
                  Copyright (C) 2025 NexusAI Contributors<br /><br />
                  This program is free software: you can redistribute it and/or modify
                  it under the terms of the GNU Affero General Public License as published
                  by the Free Software Foundation, either version 3 of the License, or
                  (at your option) any later version.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Open Source */}
        <section className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Why We Chose Open Source</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <Users className="w-10 h-10 mb-4 text-blue-500" />
              <h3 className="text-xl font-bold mb-3">Community-Driven Innovation</h3>
              <p className="text-muted-foreground">
                The best ideas come from diverse perspectives. Our community of developers, 
                enterprises, and users continuously improve NexusAI.
              </p>
            </Card>
            <Card className="p-6">
              <Shield className="w-10 h-10 mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-3">Security Through Transparency</h3>
              <p className="text-muted-foreground">
                Open source means anyone can audit the code. This transparency leads to 
                faster vulnerability detection and more secure software.
              </p>
            </Card>
            <Card className="p-6">
              <Heart className="w-10 h-10 mb-4 text-red-500" />
              <h3 className="text-xl font-bold mb-3">No Vendor Lock-in</h3>
              <p className="text-muted-foreground">
                You own your data and your deployment. Fork the project, customize it, 
                or switch providers without losing access to your ERP.
              </p>
            </Card>
          </div>
        </section>

        {/* How to Contribute */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-center">How to Contribute</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Whether you're a developer, designer, writer, or just an enthusiastic user, 
              there are many ways to contribute to NexusAI.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contributionAreas.map((area, i) => {
                const IconComponent = area.icon;
                return (
                  <Card key={i} className="p-6 hover-elevate">
                    <IconComponent className="w-8 h-8 mb-4 text-blue-500" />
                    <h3 className="font-bold text-lg mb-2">{area.title}</h3>
                    <p className="text-sm text-muted-foreground">{area.desc}</p>
                  </Card>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Link to="/docs/contributing">
                <Button size="lg" data-testid="button-read-contributing">
                  Read Contributing Guide <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Project Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <Card className="p-6">
              <div className="text-4xl font-bold text-blue-500 mb-2">812</div>
              <div className="text-muted-foreground">Forms</div>
            </Card>
            <Card className="p-6">
              <div className="text-4xl font-bold text-green-500 mb-2">18</div>
              <div className="text-muted-foreground">E2E Processes</div>
            </Card>
            <Card className="p-6">
              <div className="text-4xl font-bold text-purple-500 mb-2">40+</div>
              <div className="text-muted-foreground">Industries</div>
            </Card>
            <Card className="p-6">
              <div className="text-4xl font-bold text-orange-500 mb-2">12</div>
              <div className="text-muted-foreground">Core Modules</div>
            </Card>
          </div>
        </section>

        {/* Resources */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, i) => {
                const IconComponent = resource.icon;
                const isExternal = resource.href.startsWith("http");
                return isExternal ? (
                  <a key={i} href={resource.href} target="_blank" rel="noopener noreferrer">
                    <Card className="p-6 h-full hover-elevate cursor-pointer">
                      <IconComponent className="w-8 h-8 mb-4 text-blue-500" />
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        {resource.title}
                        <ExternalLink className="w-4 h-4" />
                      </h3>
                      <p className="text-sm text-muted-foreground">{resource.desc}</p>
                    </Card>
                  </a>
                ) : (
                  <Link key={i} to={resource.href}>
                    <Card className="p-6 h-full hover-elevate cursor-pointer">
                      <IconComponent className="w-8 h-8 mb-4 text-blue-500" />
                      <h3 className="font-bold text-lg mb-2">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground">{resource.desc}</p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* GitHub CTA */}
        <section className="px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-12 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
              <Github className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Star the repository, fork it, submit issues, or contribute code. 
                Every contribution helps make NexusAI better for everyone.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" data-testid="button-star-github">
                    <Star className="mr-2 w-5 h-5" /> Star on GitHub
                  </Button>
                </a>
                <a href="https://github.com/mbilaljunaid/nexusai-erp/fork" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-fork-github">
                    <GitFork className="mr-2 w-5 h-5" /> Fork Repository
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
