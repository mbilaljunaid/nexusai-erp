import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconNavigation } from "@/components/IconNavigation";
import { Users, BarChart3, Briefcase, DollarSign, TrendingUp, Calendar, BookOpen, Target, Heart, Award, Clock, PieChart, Settings, Zap } from "lucide-react";

export default function HR() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "employees", label: "Employees", icon: Users, color: "text-green-500" },
    { id: "recruitment", label: "Recruitment", icon: Briefcase, color: "text-purple-500" },
    { id: "payroll", label: "Payroll", icon: DollarSign, color: "text-orange-500" },
    { id: "performance", label: "Performance", icon: TrendingUp, color: "text-red-500" },
    { id: "leave", label: "Leave Mgmt", icon: Calendar, color: "text-cyan-500" },
    { id: "training", label: "Training", icon: BookOpen, color: "text-indigo-500" },
    { id: "succession", label: "Succession", icon: Target, color: "text-pink-500" },
    { id: "engagement", label: "Engagement", icon: Heart, color: "text-rose-500" },
    { id: "compensation", label: "Compensation", icon: Award, color: "text-amber-500" },
    { id: "attendance", label: "Attendance", icon: Clock, color: "text-teal-500" },
    { id: "analytics", label: "Analytics", icon: PieChart, color: "text-violet-500" },
    { id: "policies", label: "Policies", icon: Settings, color: "text-slate-500" },
    { id: "onboarding", label: "Onboarding", icon: Zap, color: "text-lime-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><Users className="w-8 h-8" />HR & Talent Management</h1>
        <p className="text-muted-foreground text-sm">Manage employees, recruitment, payroll, performance, and talent development</p>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/employees"><Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">245</p><p className="text-xs text-muted-foreground">Total Employees</p></div></CardContent></Card></Link>
            <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">12</p><p className="text-xs text-muted-foreground">Open Positions</p></div></CardContent></Card>
            <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">3.2%</p><p className="text-xs text-muted-foreground">Turnover (YTD)</p></div></CardContent></Card>
            <Card className="cursor-pointer hover-elevate"><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">94%</p><p className="text-xs text-muted-foreground">Engagement Score</p></div></CardContent></Card>
          </div>
        </div>
      )}

      {activeNav === "employees" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Card><CardHeader><CardTitle className="text-base">By Department</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Engineering: 78</p><p className="text-sm">Sales: 45</p><p className="text-sm">Operations: 34</p><p className="text-sm">HR: 12</p></div></CardContent></Card><Card><CardHeader><CardTitle className="text-base">By Status</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Active: 232</p><p className="text-sm">On Leave: 8</p><p className="text-sm">Contractors: 5</p></div></CardContent></Card></div></div>)}

      {activeNav === "recruitment" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Open Positions</p><p className="text-2xl font-bold">12</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">In Progress</p><p className="text-2xl font-bold">28</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg. Time to Hire</p><p className="text-2xl font-bold">32 days</p></CardContent></Card></div></div>)}

      {activeNav === "payroll" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Monthly Payroll</p><p className="text-2xl font-bold">$1.2M</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Next Run</p><p className="text-2xl font-bold">Dec 31</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">On Time Rate</p><p className="text-2xl font-bold text-green-600">100%</p></CardContent></Card></div></div>)}

      {activeNav === "performance" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Reviews Due</p><p className="text-2xl font-bold">34</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Completed</p><p className="text-2xl font-bold text-green-600">211</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg Rating</p><p className="text-2xl font-bold">3.8/5</p></CardContent></Card></div></div>)}

      {activeNav === "leave" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Pending Requests</p><p className="text-2xl font-bold">8</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Approved</p><p className="text-2xl font-bold">156</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg Days Used</p><p className="text-2xl font-bold">12.4</p></CardContent></Card></div></div>)}

      {activeNav === "training" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Active Programs</p><p className="text-2xl font-bold">24</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Enrollments</p><p className="text-2xl font-bold">187</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Completion Rate</p><p className="text-2xl font-bold">92%</p></CardContent></Card></div></div>)}

      {activeNav === "succession" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Key Positions</p><p className="text-2xl font-bold">18</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Successors Ready</p><p className="text-2xl font-bold">14</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Coverage %</p><p className="text-2xl font-bold text-green-600">78%</p></CardContent></Card></div></div>)}

      {activeNav === "engagement" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Survey Participation</p><p className="text-2xl font-bold">87%</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Engagement Score</p><p className="text-2xl font-bold">7.8/10</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">eNPS Score</p><p className="text-2xl font-bold">45</p></CardContent></Card></div></div>)}

      {activeNav === "compensation" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Compensation</p><p className="text-2xl font-bold">$14.2M</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Salary Reviews Due</p><p className="text-2xl font-bold">12</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Bonus Pool</p><p className="text-2xl font-bold">$2.1M</p></CardContent></Card></div></div>)}

      {activeNav === "attendance" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg Attendance</p><p className="text-2xl font-bold">96.2%</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Late Check-ins</p><p className="text-2xl font-bold">12</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Absences</p><p className="text-2xl font-bold">8</p></CardContent></Card></div></div>)}

      {activeNav === "analytics" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg Tenure</p><p className="text-2xl font-bold">4.2 yrs</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Cost per Hire</p><p className="text-2xl font-bold">$8.5K</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Retention Rate</p><p className="text-2xl font-bold">96.8%</p></CardContent></Card></div></div>)}

      {activeNav === "policies" && (<div className="space-y-4"><Card><CardHeader><CardTitle className="text-base">HR Policies</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">✓ Code of Conduct</p><p className="text-sm">✓ Leave Policy</p><p className="text-sm">✓ Anti-Harassment Policy</p><p className="text-sm">✓ Compensation Policy</p></div></CardContent></Card></div>)}

      {activeNav === "onboarding" && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">In Progress</p><p className="text-2xl font-bold">3</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Completed</p><p className="text-2xl font-bold">242</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Completion Time</p><p className="text-2xl font-bold">7.2 days</p></CardContent></Card></div></div>)}
    </div>
  );
}
