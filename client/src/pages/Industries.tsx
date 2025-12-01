import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Factory
  ShoppingCart
  DollarSign
  Stethoscope
  Building2
  GraduationCap
  Zap
  Leaf
  Cpu
  Briefcase
  Radio
  Film
  Utensils
  LogIn
  ArrowRight
  Sparkles
} from "lucide-react";

const industries = [
  { name: "Manufacturing", icon: Factory, modules: 7, color: "bg-cyan-500/10 text-cyan-600", description: "Production, Quality, Maintenance, Forecasting" }
  { name: "Retail & E-Commerce", icon: ShoppingCart, modules: 6, color: "bg-blue-500/10 text-blue-600", description: "POS, Omni-channel, Inventory, Loyalty" }
  { name: "Financial Services", icon: DollarSign, modules: 5, color: "bg-green-500/10 text-green-600", description: "Risk, Portfolio, Compliance, Lending" }
  { name: "Healthcare", icon: Stethoscope, modules: 6, color: "bg-red-500/10 text-red-600", description: "Patient Mgmt, Clinical Data, Billing" }
  { name: "Construction & Real Estate", icon: Building2, modules: 6, color: "bg-orange-500/10 text-orange-600", description: "Projects, Budgeting, Property Mgmt" }
  { name: "Education & Training", icon: GraduationCap, modules: 6, color: "bg-purple-500/10 text-purple-600", description: "Student Mgmt, Curriculum, Assessments" }
  { name: "Energy & Utilities", icon: Zap, modules: 5, color: "bg-yellow-500/10 text-yellow-600", description: "Asset Mgmt, Demand Forecasting, Billing" }
  { name: "Agriculture & Food", icon: Leaf, modules: 6, color: "bg-green-600/10 text-green-700", description: "Supply Chain, Yield Forecasting, Quality" }
  { name: "Technology & IT Services", icon: Cpu, modules: 6, color: "bg-indigo-500/10 text-indigo-600", description: "SDLC, Projects, Resource Mgmt" }
  { name: "Professional Services", icon: Briefcase, modules: 6, color: "bg-slate-500/10 text-slate-600", description: "Projects, Billing, Knowledge Mgmt" }
  { name: "Telecommunications", icon: Radio, modules: 6, color: "bg-pink-500/10 text-pink-600", description: "Network Mgmt, Billing, Support" }
  { name: "Media & Entertainment", icon: Film, modules: 6, color: "bg-rose-500/10 text-rose-600", description: "Content, Campaigns, Revenue Tracking" }
  { name: "Wholesale & Distribution", icon: ShoppingCart, modules: 5, color: "bg-amber-500/10 text-amber-600", description: "Logistics, Warehousing, Procurement" }
  { name: "Hospitality & Travel", icon: Utensils, modules: 6, color: "bg-lime-500/10 text-lime-600", description: "Reservations, Property Mgmt, Loyalty" }
  { name: "Public Sector & Government", icon: LogIn, modules: 6, color: "bg-blue-700/10 text-blue-700", description: "Finance, HR, Compliance, Citizen Svc" }
];

export default function Industries() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Industry Solutions</h1>
        <p className="text-muted-foreground">
          NexusAI provides pre-built, AI-powered solutions for 15+ industries. Each solution includes industry-specific modules, compliance rules, workflows, and KPIs.
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          <Sparkles className="h-3 w-3 mr-1" />
          All solutions powered by AI
        </Badge>
        <span className="text-sm text-muted-foreground">{industries.length} industries • 75+ modules • Global compliance</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {industries.map((industry) => {
          const Icon = industry.icon;
          return (
            <Card key={industry.name} className="hover-elevate flex flex-col" data-testid={`card-industry-${industry.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className={`p-3 rounded-lg ${industry.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-xs">{industry.modules} modules</Badge>
                </div>
                <CardTitle className="text-base mt-2">{industry.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <p className="text-sm text-muted-foreground">{industry.description}</p>
                <Button variant="outline" size="sm" className="w-full" data-testid={`button-explore-${industry.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  Explore Solution
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Powered Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">Every industry solution includes:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Pre-configured workflows and approvals for your industry</li>
            <li>Industry-specific compliance rules (GDPR, HIPAA, SOX, FDA, ISO, etc.)</li>
            <li>AI-powered KPI dashboards and predictive analytics</li>
            <li>Automated process mapping and optimization recommendations</li>
            <li>AI Copilot trained on industry best practices</li>
            <li>Self-healing capabilities for common industry issues</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
