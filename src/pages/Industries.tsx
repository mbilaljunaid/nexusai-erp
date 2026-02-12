import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface IndustryCard {
  title: string;
  icon: LucideIcon;
  description: string;
  features: string[];
  path: string;
  color: string;
}

const industries: IndustryCard[] = [
  {
    title: "Healthcare",
    icon: Heart,
    description: "Patient & Clinical Management",
    features: ["Patients", "Appointments", "Clinical Docs", "Pharmacy", "Medical Billing", "BI Dashboard"],
    path: "/industry/healthcare/patients",
    color: "from-red-500/10 to-pink-500/10 border-red-200",
  },
  {
    title: "Telecom",
    icon: Wifi,
    description: "Network & Billing Operations",
    features: ["Network OSS", "Billing & Revenue", "Monitoring", "Devices & SIM", "SLA Management"],
    path: "/industry/telecom/network-oss",
    color: "from-blue-500/10 to-cyan-500/10 border-blue-200",
  },
  {
    title: "Hospitality",
    icon: Hotel,
    description: "Reservations & Guest CRM",
    features: ["Reservations", "Front Desk", "F&B POS", "Events", "Guest CRM", "BI Dashboard"],
    path: "/industry/hospitality/reservations",
    color: "from-purple-500/10 to-pink-500/10 border-purple-200",
  },
  {
    title: "Retail & Commerce",
    icon: ShoppingBag,
    description: "POS & Omnichannel",
    features: ["Point of Sale", "Store Ops", "Omnichannel", "Merchandise", "E-Commerce"],
    path: "/industry/retail/pos",
    color: "from-green-500/10 to-emerald-500/10 border-green-200",
  },
  {
    title: "Logistics",
    icon: Boxes,
    description: "Shipping & Cold Chain",
    features: ["Shipping", "Cold Chain", "Optimization", "Analytics", "Warehouse"],
    path: "/industry/logistics/shipping",
    color: "from-orange-500/10 to-amber-500/10 border-orange-200",
  },
  {
    title: "Automotive",
    icon: Car,
    description: "Production & Sales",
    features: ["Production", "Sales CRM", "Supply Chain", "Quality Analytics", "BI Dashboard"],
    path: "/industry/automotive/production",
    color: "from-slate-500/10 to-gray-500/10 border-slate-200",
  },
  {
    title: "Banking & Finance",
    icon: Landmark,
    description: "Core Banking & Loans",
    features: ["Core Banking", "Customer Accounts", "Loans & Credit", "Payments", "AI Fraud Detection", "BI"],
    path: "/industry/banking/core",
    color: "from-yellow-500/10 to-amber-500/10 border-yellow-200",
  },
  {
    title: "Insurance",
    icon: Shield,
    description: "Policies & Claims",
    features: ["Policy Mgmt", "Claims", "Underwriting", "Billing & Premiums", "BI Dashboard"],
    path: "/industry/insurance/policies",
    color: "from-indigo-500/10 to-blue-500/10 border-indigo-200",
  },
  {
    title: "Government",
    icon: Landmark,
    description: "Citizen Services",
    features: ["Citizen Services", "Procurement", "Grants & Funding", "Compliance", "HR & Workforce", "BI"],
    path: "/industry/government/citizen",
    color: "from-teal-500/10 to-cyan-500/10 border-teal-200",
  },
  {
    title: "Education",
    icon: GraduationCap,
    description: "Admissions & Faculty",
    features: ["Dashboard", "Admissions", "Faculty", "Billing", "Analytics"],
    path: "/industry/education/dashboard",
    color: "from-violet-500/10 to-purple-500/10 border-violet-200",
  },
  {
    title: "Energy & Utilities",
    icon: Flame,
    description: "Grid Ops & Trading",
    features: ["Grid Operations", "Energy Trading", "Analytics"],
    path: "/industry/energy/grid",
    color: "from-red-500/10 to-orange-500/10 border-red-200",
  },
];

export default function Industries() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Industry Solutions</h1>
        <p className="text-muted-foreground">
          Specialized modules tailored for industry-specific workflows and compliance requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((industry) => (
          <Link key={industry.title} to={industry.path}>
            <Card className={`hover:shadow-lg transition-all cursor-pointer h-full bg-gradient-to-br ${industry.color}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background/80">
                    <industry.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{industry.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{industry.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {industry.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
