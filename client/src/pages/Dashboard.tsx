import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  TrendingUp,
  Zap,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();

  const metrics = [
    {
      label: "Active Users",
      value: "2,847",
      change: "+12.5%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Total Revenue",
      value: "$128.5K",
      change: "+8.2%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Growth Rate",
      value: "24.8%",
      change: "-2.1%",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      label: "Performance",
      value: "95%",
      change: "+5%",
      icon: Zap,
      color: "text-orange-600",
    },
  ];

  const recentActivities = [
    {
      title: "Invoice Generated",
      description: "INV-2025-001234 created",
      time: "2 hours ago",
      status: "completed",
    },
    {
      title: "Order Received",
      description: "Order ORD-789456 from Acme Corp",
      time: "4 hours ago",
      status: "completed",
    },
    {
      title: "System Update",
      description: "Platform updated to v2.5.1",
      time: "1 day ago",
      status: "completed",
    },
    {
      title: "Low Inventory Alert",
      description: "Product SKU-2847 below threshold",
      time: "3 days ago",
      status: "alert",
    },
  ];

  const topModules = [
    { name: "CRM", description: "Customer Management", path: "/crm", color: "from-blue-500 to-cyan-500" },
    { name: "Finance", description: "Accounting & Billing", path: "/finance", color: "from-green-500 to-emerald-500" },
    { name: "HR", description: "Human Resources", path: "/hr", color: "from-purple-500 to-pink-500" },
    { name: "Projects", description: "Project Management", path: "/projects", color: "from-orange-500 to-red-500" },
    { name: "Analytics", description: "Business Intelligence", path: "/analytics", color: "from-indigo-500 to-blue-500" },
    { name: "Logistics", description: "Supply Chain", path: "/industry/logistics", color: "from-cyan-500 to-blue-500" },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's your business overview.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{metric.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{metric.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${metric.color}`} />
              </div>
              <Badge variant="secondary" className="text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30">
                {metric.change}
              </Badge>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-0">
                <div>
                  {activity.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-1" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{activity.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{activity.description}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">System Health</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">99.9%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-green-600 dark:bg-green-500 h-2 rounded-full" style={{ width: "99.9%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">API Usage</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">64%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: "64%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Storage</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">42%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full" style={{ width: "42%" }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Module Navigation */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Access Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topModules.map((module) => (
            <button
              key={module.name}
              onClick={() => navigate(module.path)}
              data-testid={`button-module-${module.name.toLowerCase()}`}
              className="text-left group hover-elevate rounded-lg overflow-hidden transition-all"
            >
              <div className={`h-20 bg-gradient-to-r ${module.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{module.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{module.description}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
