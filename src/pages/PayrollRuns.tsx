import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ChevronRight, Settings, BarChart3, RefreshCw, Upload, Zap, FileText, Wrench } from "lucide-react";
import { Link } from "wouter";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export default function PayrollRuns() {
  const { legalEntityId } = useEnterpriseStore();
  const { data: payrollRuns = [] } = useQuery<any[]>({
    queryKey: ["/api/hr/payroll-runs", legalEntityId],
    queryFn: () => fetch("/api/hr/payroll-runs", { headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined }).then(r => r.json())
  });

  const safeRuns = Array.isArray(payrollRuns) ? payrollRuns : [];
  const totalAmount = safeRuns.reduce((sum, r: any) => sum + parseFloat(r.totalAmount || 0), 0);
  const processedCount = safeRuns.filter((r: any) => r.status === "processed").length;

  return (
    <StandardPage
      title="Payroll Runs"
      description="Process salary and compensation"
    >

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Payroll</p>
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Payroll Runs</p>
            <p className="text-2xl font-bold">{payrollRuns.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Processed</p>
            <p className="text-2xl font-bold text-green-600">{processedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Functions Nav Cards */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Payroll Functions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { title: "Payroll Workbench", desc: "Run and manage payroll", href: "/hr/payroll/workbench", icon: Wrench },
            { title: "Processing", desc: "Process payroll actions", href: "/hr/payroll/processing", icon: Zap },
            { title: "Retroactive Pay", desc: "Retro pay calculation engine", href: "/hr/payroll/retro", icon: RefreshCw },
            { title: "Element Config", desc: "Pay element setup", href: "/hr/payroll/setup/elements", icon: Settings },
            { title: "Payroll Costing", desc: "Cost allocation configuration", href: "/hr/payroll/setup/costing", icon: DollarSign },
            { title: "YTD Balances", desc: "Year-to-date balance upload", href: "/hr/payroll/setup/balances", icon: Upload },
            { title: "My Payslips", desc: "Employee payslip viewer", href: "/hr/rewards/payslips", icon: FileText },
            { title: "Analytics", desc: "Payroll analytics and reports", href: "/analytics", icon: BarChart3 },
          ].map((mod) => (
            <Link key={mod.href} to={mod.href}>
              <Card className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium">{mod.title}</CardTitle>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-0">
                  <mod.icon className="h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground">{mod.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {payrollRuns.map((run: any) => (
              <div key={run.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-semibold">Payroll Period: {run.periodStart} to {run.periodEnd}</p>
                  <p className="text-sm text-muted-foreground">{run.employeeCount} employees</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${run.totalAmount}</p>
                  <Badge variant={run.status === "processed" ? "default" : "secondary"}>{run.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
