import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, BarChart3, Users, Settings, Building2, Briefcase } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();

  const modules = [
    {
      name: "CRM",
      description: "Customer Relationship Management",
      icon: Users,
      path: "/crm",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "ERP",
      description: "Enterprise Resource Planning",
      icon: Building2,
      path: "/erp",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "HR",
      description: "Human Resources",
      icon: Users,
      path: "/hr",
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Projects",
      description: "Project Management",
      icon: Briefcase,
      path: "/projects",
      color: "from-orange-500 to-red-500",
    },
    {
      name: "Analytics",
      description: "Business Intelligence",
      icon: BarChart3,
      path: "/analytics",
      color: "from-indigo-500 to-blue-500",
    },
    {
      name: "Logistics",
      description: "Supply Chain & Logistics",
      icon: Zap,
      path: "/industry/logistics",
      color: "from-cyan-500 to-blue-500",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">NexusAI</h1>
              <p className="text-slate-600 dark:text-slate-400">Enterprise AI-First Platform</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/settings")}
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to Your Enterprise Platform
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Manage your entire business with 809+ integrated applications. Choose a module below to get started.
          </p>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.path}
                className="group hover-elevate cursor-pointer overflow-hidden transition-all"
                onClick={() => navigate(module.path)}
                data-testid={`card-module-${module.name.toLowerCase()}`}
              >
                <div className={`h-24 bg-gradient-to-r ${module.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {module.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {module.description}
                      </p>
                    </div>
                    <Icon className="w-6 h-6 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(module.path);
                    }}
                    data-testid={`button-enter-${module.name.toLowerCase()}`}
                  >
                    Enter Module
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { label: "Pages", value: "809+" },
            { label: "Forms", value: "809+" },
            { label: "Industries", value: "43+" },
            { label: "Modules", value: "17+" },
          ].map((stat) => (
            <Card key={stat.label} className="p-6 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {stat.label}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-slate-600 dark:text-slate-400">
            NexusAI © 2025 • Enterprise AI Platform • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
