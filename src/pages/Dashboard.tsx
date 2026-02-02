import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Briefcase, 
  Package, 
  Factory, 
  BarChart3, 
  Sparkles,
  Shield,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

const modules = [
  { title: "Dashboard", description: "Overview and KPIs", icon: LayoutDashboard, path: "/dashboard", color: "bg-blue-500" },
  { title: "CRM & Sales", description: "Customer relationships", icon: Users, path: "/crm", color: "bg-green-500" },
  { title: "Finance", description: "Financial management", icon: DollarSign, path: "/finance", color: "bg-yellow-500" },
  { title: "HR & Talent", description: "Human resources", icon: Briefcase, path: "/hr", color: "bg-purple-500" },
  { title: "Supply Chain", description: "Procurement & logistics", icon: Package, path: "/scm", color: "bg-orange-500" },
  { title: "Manufacturing", description: "Production control", icon: Factory, path: "/manufacturing", color: "bg-red-500" },
  { title: "Analytics", description: "Business intelligence", icon: BarChart3, path: "/analytics", color: "bg-indigo-500" },
  { title: "AI Assistant", description: "Intelligent automation", icon: Sparkles, path: "/ai", color: "bg-pink-500" },
  { title: "Admin", description: "System administration", icon: Shield, path: "/admin", color: "bg-slate-500" },
  { title: "Settings", description: "Configuration", icon: Settings, path: "/settings", color: "bg-gray-500" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to NexusAI ERP</h1>
        <p className="text-muted-foreground">Select a module to get started</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((module) => (
          <Link key={module.path} to={module.path}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-lg ${module.color}`}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
