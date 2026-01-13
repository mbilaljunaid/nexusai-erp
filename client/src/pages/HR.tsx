import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { openFormInNewWindow } from "@/lib/formUtils";
import { Users, Briefcase, Clock, TrendingUp, BarChart3, Settings } from "lucide-react";
import HrDashboard from "./hr/HrDashboard";
import EmployeesList from "./EmployeesList";

export default function HR() {
  const [activeNav, setActiveNav] = useState("overview");

  const { data: employees = [] } = useQuery<any[]>({
    queryKey: ["/api/employees"],
    retry: false
  });

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500", formId: null },
    { id: "employees", label: "Employees", icon: Users, color: "text-green-500", formId: "employees" },
    { id: "payroll", label: "Payroll", icon: Briefcase, color: "text-purple-500", formId: "payroll" },
    { id: "timesheet", label: "Timesheet", icon: Clock, color: "text-orange-500", formId: "timesheet" },
    { id: "performance", label: "Performance", icon: TrendingUp, color: "text-pink-500", formId: null },
    { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500", formId: null },
  ];

  const handleIconClick = (formId: string | null) => {
    if (formId) {
      openFormInNewWindow(formId, `${formId.charAt(0).toUpperCase() + formId.slice(1)} Form`);
    } else {
      setActiveNav("overview");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="h-8 w-8" />Human Resources</h1>
        <p className="text-muted-foreground text-sm">Manage employees, payroll, performance, and HR operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleIconClick(item.formId)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${!item.formId ? "hover:border-primary hover-elevate" : "hover:bg-primary/10 hover:border-primary hover-elevate"
              }`}
            data-testid={`button-icon-${item.id}`}
          >
            <item.icon className={`w-6 h-6 ${item.color}`} />
            <span className="text-sm font-medium text-center">{item.label}</span>
          </button>
        ))}
      </div>

      {activeNav === "overview" && (
        <HrDashboard />
      )}

      {activeNav === "employees" && (
        <div className="space-y-4">
          <EmployeesList />
        </div>
      )}

      {activeNav === "payroll" && (
        <Card><CardHeader><CardTitle>Payroll</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage payroll processing and employee compensation</p></CardContent></Card>
      )}

      {activeNav === "timesheet" && (
        <Card><CardHeader><CardTitle>Timesheets</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Track employee hours and time off</p></CardContent></Card>
      )}

      {activeNav === "performance" && (
        <Card><CardHeader><CardTitle>Performance</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage employee reviews and performance goals</p></CardContent></Card>
      )}

      {activeNav === "settings" && (
        <Card><CardHeader><CardTitle>HR Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure HR policies and workflows</p></CardContent></Card>
      )}
    </div>
  );
}
