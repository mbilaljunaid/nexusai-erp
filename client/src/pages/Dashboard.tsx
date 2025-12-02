import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useState } from "react";
import {
  BarChart3,
  Users,
  ShoppingCart,
  Briefcase,
  Settings,
  FileText,
  Zap,
  Brain,
  Layers,
  TrendingUp,
  Package,
  DollarSign,
  Factory,
  Truck,
  Headphones,
  Target,
  Lock,
  Database,
  Code,
  Workflow,
  Home,
  Plus,
} from "lucide-react";

export default function Dashboard() {
  const modules = [
    { title: "CRM", url: "/crm", icon: Target, color: "text-blue-500", description: "Customer Relationship Management" },
    { title: "Projects", url: "/projects", icon: Briefcase, color: "text-purple-500", description: "Project Management" },
    { title: "ERP", url: "/erp", icon: Layers, color: "text-green-500", description: "Enterprise Resource Planning" },
    { title: "HR", url: "/hr", icon: Users, color: "text-orange-500", description: "Human Resources" },
    { title: "Finance", url: "/finance", icon: DollarSign, color: "text-yellow-500", description: "Finance & Accounting" },
    { title: "Manufacturing", url: "/manufacturing", icon: Factory, color: "text-red-500", description: "Manufacturing & Production" },
    { title: "Supply Chain", url: "/inventory", icon: Package, color: "text-cyan-500", description: "Supply Chain & Logistics" },
    { title: "Sales", url: "/opportunities", icon: TrendingUp, color: "text-lime-500", description: "Sales Pipeline" },
    { title: "Service", url: "/service-tickets", icon: Headphones, color: "text-pink-500", description: "Service & Support" },
    { title: "Analytics", url: "/business-intelligence", icon: BarChart3, color: "text-indigo-500", description: "Analytics & BI" },
    { title: "Compliance", url: "/compliance-dashboard", icon: Lock, color: "text-rose-500", description: "Governance & Compliance" },
    { title: "AI Assistant", url: "/ai-assistant-advanced", icon: Brain, color: "text-violet-500", description: "AI & Automation" },
  ];

  const quickLinks = [
    { title: "Processes", url: "/process-hub", icon: Workflow, color: "text-blue-600" },
    { title: "Integrations", url: "/integration-hub", icon: Code, color: "text-green-600" },
    { title: "API", url: "/api-management", icon: Code, color: "text-purple-600" },
    { title: "Admin", url: "/user-management", icon: Settings, color: "text-gray-600" },
    { title: "Database", url: "/data-explorer", icon: Database, color: "text-orange-600" },
    { title: "Reports", url: "/reports", icon: FileText, color: "text-red-600" },
  ];

  const [selectedReportModule, setSelectedReportModule] = useState("crm");

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }]} />

      <div className="space-y-2">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Home className="w-10 h-10 text-primary" />
          Welcome to NexusAI
        </h1>
        <p className="text-muted-foreground text-lg">Enterprise ERP Platform - Manage all your business operations in one place</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">245</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Active Processes</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold">42</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">Core Modules</h2>
          <p className="text-muted-foreground mb-4">Access all major business modules and processes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <Link key={module.url} to={module.url}>
              <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-muted`}>
                      <module.icon className={`w-6 h-6 ${module.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.url} to={link.url}>
              <Card className="hover:shadow-md hover:border-primary transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                  <link.icon className={`w-6 h-6 ${link.color}`} />
                  <p className="text-sm font-medium">{link.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <Link to="/reports">
            <Button size="sm" variant="outline" data-testid="button-view-all-reports">
              View All Reports
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { module: "crm", title: "CRM Reports", color: "bg-blue-50 dark:bg-blue-950", icon: Target },
            { module: "finance", title: "Finance Reports", color: "bg-yellow-50 dark:bg-yellow-950", icon: DollarSign },
            { module: "supply_chain", title: "Supply Chain Reports", color: "bg-cyan-50 dark:bg-cyan-950", icon: Package },
          ].map(({ module, title, color, icon: Icon }) => (
            <Link key={module} to={`/reports/${module}`}>
              <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className={`p-4 rounded-lg ${color} mb-4 w-fit`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">Access and build custom reports</p>
                  <Button size="sm" variant="ghost" className="mt-4" data-testid={`button-reports-${module}`}>
                    Explore →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Getting Started</h3>
          <p className="text-sm text-muted-foreground mb-4">
            New to NexusAI? Start with the Process Hub to understand our 18 end-to-end business processes, then navigate to specific modules using the menu on the left.
          </p>
          <Link to="/process-hub">
            <button className="text-sm font-medium text-primary hover:underline">Explore Processes →</button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
