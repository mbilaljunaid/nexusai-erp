import { Header, Footer } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, X, AlertCircle, ArrowRight, BarChart3, Zap, Shield } from "lucide-react";

export default function FeaturesComparison() {
  const features = [
    { category: "Core Features", items: [
      { name: "All-in-One ERP Platform", nexusai: true, oracle: false, salesforce: false, odoo: true, sap: false },
      { name: "AI-Powered Insights", nexusai: true, oracle: false, salesforce: true, odoo: false, sap: false },
      { name: "40+ Industry Templates", nexusai: true, oracle: false, salesforce: false, odoo: false, sap: false },
      { name: "Pre-Configured Workflows", nexusai: true, oracle: false, salesforce: true, odoo: true, sap: false },
    ]},
    { category: "Reports & Analytics", items: [
      { name: "50+ Pre-built Reports", nexusai: true, oracle: true, salesforce: true, odoo: true, sap: true },
      { name: "SmartViews (Custom Filtered Views)", nexusai: true, oracle: false, salesforce: false, odoo: false, sap: false },
      { name: "Pivot Tables & Charts", nexusai: true, oracle: true, salesforce: true, odoo: true, sap: true },
      { name: "Excel Import/Export", nexusai: true, oracle: true, salesforce: true, odoo: true, sap: true },
      { name: "Real-time Spreadsheet Editor", nexusai: true, oracle: false, salesforce: false, odoo: false, sap: false },
    ]},
    { category: "Implementation & Support", items: [
      { name: "Fast Implementation (weeks vs months)", nexusai: true, oracle: false, salesforce: true, odoo: true, sap: false },
      { name: "No Complex Customization Needed", nexusai: true, oracle: false, salesforce: true, odoo: true, sap: false },
      { name: "24/7 AI Copilot Support", nexusai: true, oracle: false, salesforce: false, odoo: false, sap: false },
      { name: "Cloud-Native Multi-tenant", nexusai: true, oracle: true, salesforce: true, odoo: true, sap: true },
    ]},
    { category: "Pricing & Accessibility", items: [
      { name: "Transparent Pricing", nexusai: true, oracle: false, salesforce: false, odoo: true, sap: false },
      { name: "Suitable for SMB to Enterprise", nexusai: true, oracle: false, salesforce: true, odoo: true, sap: false },
      { name: "No License Lock-in", nexusai: true, oracle: false, salesforce: false, odoo: true, sap: false },
    ]},
  ];

  const companies = [
    { name: "NexusAI", color: "bg-blue-50 dark:bg-blue-950", strength: "AI-First, Industry-Ready, Fast" },
    { name: "Oracle", color: "bg-red-50 dark:bg-red-950", strength: "Enterprise Scale, Legacy Support" },
    { name: "Salesforce", color: "bg-green-50 dark:bg-green-950", strength: "CRM Excellence, Cloud Native" },
    { name: "Odoo", color: "bg-purple-50 dark:bg-purple-950", strength: "Open Source, Affordable" },
    { name: "SAP", color: "bg-amber-50 dark:bg-amber-950", strength: "Complex Operations, Global Scale" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="px-4 py-24 max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Features & Functionality Comparison</h1>
          <p className="text-xl text-muted-foreground mb-8">
            How NexusAI compares with leading ERP solutions. Discover why enterprises choose NexusAI for faster implementation and AI-driven insights.
          </p>

          {/* Company Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
            {companies.map((company) => (
              <Card key={company.name} className={`p-6 ${company.color}`}>
                <h3 className="font-bold text-lg mb-2">{company.name}</h3>
                <p className="text-sm text-muted-foreground">{company.strength}</p>
              </Card>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <div className="space-y-8">
            {features.map((section) => (
              <div key={section.category}>
                <h2 className="text-2xl font-bold mb-4">{section.category}</h2>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="text-left p-4 font-bold">Feature</th>
                        <th className="text-center p-4 font-bold w-20">NexusAI</th>
                        <th className="text-center p-4 font-bold w-20">Oracle</th>
                        <th className="text-center p-4 font-bold w-20">Salesforce</th>
                        <th className="text-center p-4 font-bold w-20">Odoo</th>
                        <th className="text-center p-4 font-bold w-20">SAP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item) => (
                        <tr key={item.name} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-semibold">{item.name}</td>
                          {[item.nexusai, item.oracle, item.salesforce, item.odoo, item.sap].map((available, idx) => (
                            <td key={idx} className="text-center p-4">
                              {available ? (
                                <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-red-400 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Key Differentiators */}
          <div className="mt-16 space-y-8">
            <h2 className="text-3xl font-bold">Why NexusAI Stands Out</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Lightning-Fast Implementation",
                  desc: "Deploy in weeks, not months. Pre-configured workflows get you live 50% faster than traditional ERP systems."
                },
                {
                  icon: BarChart3,
                  title: "Advanced Analytics Built-In",
                  desc: "50+ reports, SmartViews, pivot tables, and Excel integration. No need for separate BI tools."
                },
                {
                  icon: Shield,
                  title: "AI-First Architecture",
                  desc: "Predictive insights, automated workflows, and intelligent recommendations across all modules."
                },
              ].map((item) => (
                <Card key={item.title} className="p-6 hover-elevate">
                  <item.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* TCO Comparison */}
          <Card className="mt-12 p-8 bg-muted/50">
            <h2 className="text-2xl font-bold mb-6">Total Cost of Ownership (TCO) Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">NexusAI</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ Transparent, predictable pricing</li>
                  <li>✓ 50% faster implementation = lower consulting costs</li>
                  <li>✓ No custom development needed for most use cases</li>
                  <li>✓ Lower training costs with intuitive UI</li>
                  <li>✓ Average ROI: 12-18 months</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">Traditional ERP (Oracle, SAP)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✗ High licensing costs with complex pricing models</li>
                  <li>✗ 6-18 month implementation = high consulting fees</li>
                  <li>✗ Extensive customization required</li>
                  <li>✗ Expensive training and change management</li>
                  <li>✗ Average ROI: 24-36 months</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <Card className="mt-12 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Choose NexusAI?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Experience the difference of an AI-First, Industry-Ready ERP platform. Get instant access to a fully configured demo environment for your industry.
            </p>
            <Link to="/login">
              <Button size="lg" className="inline-flex gap-2">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
