import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconNavigation } from "@/components/IconNavigation";
import { Users, BarChart3, Briefcase, DollarSign, TrendingUp } from "lucide-react";

export default function HR() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "employees", label: "Employees", icon: Users, color: "text-green-500" },
    { id: "recruitment", label: "Recruitment", icon: Briefcase, color: "text-purple-500" },
    { id: "payroll", label: "Payroll", icon: DollarSign, color: "text-orange-500" },
    { id: "performance", label: "Performance", icon: TrendingUp, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><Users className="w-8 h-8" />HR & Talent Management</h1>
        <p className="text-muted-foreground text-sm">Manage employees, recruitment, payroll, and performance</p>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/employees">
              <Card className="cursor-pointer hover-elevate" data-testid="card-total-employees">
                <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">245</p><p className="text-xs text-muted-foreground">Total Employees</p></div></CardContent>
              </Card>
            </Link>
            <Link href="/talent-pool">
              <Card className="cursor-pointer hover-elevate" data-testid="card-open-positions">
                <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">12</p><p className="text-xs text-muted-foreground">Open Positions</p></div></CardContent>
              </Card>
            </Link>
            <Link href="/performance-reviews">
              <Card className="cursor-pointer hover-elevate" data-testid="card-turnover">
                <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">3.2%</p><p className="text-xs text-muted-foreground">Turnover (YTD)</p></div></CardContent>
              </Card>
            </Link>
            <Card className="cursor-pointer hover-elevate" data-testid="card-engagement">
              <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">94%</p><p className="text-xs text-muted-foreground">Employee Engagement</p></div></CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeNav === "employees" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-base">By Department</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Engineering: 78</p><p className="text-sm">Sales: 45</p><p className="text-sm">Operations: 34</p></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">By Status</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Active: 232</p><p className="text-sm">On Leave: 8</p><p className="text-sm">Contractors: 5</p></div></CardContent></Card>
          </div>
        </div>
      )}

      {activeNav === "recruitment" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Open Positions</p><p className="text-2xl font-bold">12</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">In Progress</p><p className="text-2xl font-bold">28</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg. Time to Hire</p><p className="text-2xl font-bold">32 days</p></CardContent></Card>
          </div>
        </div>
      )}

      {activeNav === "payroll" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Monthly Payroll</p><p className="text-2xl font-bold">$1.2M</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Next Run</p><p className="text-2xl font-bold">Dec 31</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">On Time Rate</p><p className="text-2xl font-bold text-green-600">100%</p></CardContent></Card>
          </div>
        </div>
      )}

      {activeNav === "performance" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Reviews Due</p><p className="text-2xl font-bold">34</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Completed</p><p className="text-2xl font-bold text-green-600">211</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg Rating</p><p className="text-2xl font-bold">3.8/5</p></CardContent></Card>
          </div>
        </div>
      )}
    </div>
  );
}
