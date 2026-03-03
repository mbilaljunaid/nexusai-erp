import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Wifi,
  Hotel,
  ShoppingBag,
  Boxes,
  Car,
  Landmark,
  Shield,
  GraduationCap,
  Flame,
  LucideIcon,
  ArrowRight,
} from "lucide-react";

interface IndustryCard {
  title: string;
  code: string;
  icon: LucideIcon;
  description: string;
  features: string[];
  modules: number;
  tenants: number;
  color: string;
}

const industries: IndustryCard[] = [
  {
    title: "Healthcare",
    code: "healthcare",
    icon: Heart,
    description: "Patient & Clinical Management",
    features: ["Patients", "Appointments", "Clinical Docs", "Pharmacy", "Medical Billing", "BI Dashboard"],
    modules: 8,
    tenants: 156,
    color: "from-red-500/10 to-pink-500/10 border-red-200",
  },
  {
    title: "Telecom",
    code: "telecom",
    icon: Wifi,
    description: "Network & Billing Operations",
    features: ["Network OSS", "Billing & Revenue", "Monitoring", "Devices & SIM", "SLA Management"],
    modules: 7,
    tenants: 89,
    color: "from-blue-500/10 to-cyan-500/10 border-blue-200",
  },
  {
    title: "Hospitality",
    code: "hospitality",
    icon: Hotel,
    description: "Reservations & Guest CRM",
    features: ["Reservations", "Front Desk", "F&B POS", "Events", "Guest CRM", "BI Dashboard"],
    modules: 9,
    tenants: 124,
    color: "from-purple-500/10 to-pink-500/10 border-purple-200",
  },
  {
    title: "Retail & Commerce",
    code: "retail",
    icon: ShoppingBag,
    description: "POS & Omnichannel",
    features: ["Point of Sale", "Store Ops", "Omnichannel", "Merchandise", "E-Commerce"],
    modules: 8,
    tenants: 203,
    color: "from-green-500/10 to-emerald-500/10 border-green-200",
  },
  {
    title: "Logistics",
    code: "logistics",
    icon: Boxes,
    description: "Shipping & Cold Chain",
    features: ["Shipping", "Cold Chain", "Optimization", "Analytics", "Warehouse"],
    modules: 7,
    tenants: 67,
    color: "from-orange-500/10 to-amber-500/10 border-orange-200",
  },
  {
    title: "Automotive",
    code: "automotive",
    icon: Car,
    description: "Production & Sales",
    features: ["Production", "Sales CRM", "Supply Chain", "Quality Analytics", "BI Dashboard"],
    modules: 9,
    tenants: 45,
    color: "from-slate-500/10 to-gray-500/10 border-slate-200",
  },
  {
    title: "Banking & Finance",
    code: "banking",
    icon: Landmark,
    description: "Core Banking & Loans",
    features: ["Core Banking", "Customer Accounts", "Loans & Credit", "Payments", "AI Fraud Detection", "BI"],
    modules: 10,
    tenants: 78,
    color: "from-yellow-500/10 to-amber-500/10 border-yellow-200",
  },
  {
    title: "Insurance",
    code: "insurance",
    icon: Shield,
    description: "Policies & Claims",
    features: ["Policy Mgmt", "Claims", "Underwriting", "Billing & Premiums", "BI Dashboard"],
    modules: 7,
    tenants: 52,
    color: "from-indigo-500/10 to-blue-500/10 border-indigo-200",
  },
  {
    title: "Government",
    code: "government",
    icon: Landmark,
    description: "Citizen Services",
    features: ["Citizen Services", "Procurement", "Grants & Funding", "Compliance", "HR & Workforce", "BI"],
    modules: 8,
    tenants: 34,
    color: "from-teal-500/10 to-cyan-500/10 border-teal-200",
  },
  {
    title: "Education",
    code: "education",
    icon: GraduationCap,
    description: "Admissions & Faculty",
    features: ["Dashboard", "Admissions", "Faculty", "Billing", "Analytics"],
    modules: 6,
    tenants: 112,
    color: "from-violet-500/10 to-purple-500/10 border-violet-200",
  },
  {
    title: "Energy & Utilities",
    code: "energy",
    icon: Flame,
    description: "Grid Ops & Trading",
    features: ["Grid Operations", "Energy Trading", "Analytics"],
    modules: 5,
    tenants: 28,
    color: "from-red-500/10 to-orange-500/10 border-red-200",
  },
];

export default function Industries() {
  return (
    <StandardPage
      title="Industry Solutions"
      des<p className="text-muted-foreground">
          Specialized modules tailored for industry-specific workflows and compliance requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((industry) => (
          <Card key={industry.code} className={`hover:shadow-lg transition-all h-full bg-gradient-to-br ${industry.color}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background/80">
                    <industry.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{industry.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{industry.description}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-primary">{industry.modules}</div>
                  <div className="text-xs text-muted-foreground">Modules</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-primary">{industry.tenants}</div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1.5">
                {industry.features.slice(0, 4).map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {industry.features.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{industry.features.length - 4} more
                  </Badge>
                )}
              </div>

              {/* CTA Button */}
              <Link to={`/industry/${industry.code}/dashboard`}>
                <Button className="w-full group" variant="default">
                  View Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">Total Industries</p>
            <p className="text-3xl font-bold">11</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">Total Modules</p>
            <p className="text-3xl font-bold">84</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">Active Tenants</p>
            <p className="text-3xl font-bold">1,188</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">Avg Modules/Industry</p>
            <p className="text-3xl font-bold">7.6</p>
          </CardHeader>
        </Card>
      </div>
    </StandardPage>
  );
}
