import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { DollarSign, Calculator, TrendingUp, AlertCircle, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

interface PayrollRun {
  id: string;
  name: string;
  period: string;
  status: string;
  totalAmount?: string;
}

export default function PayrollEngine() {
  const [activeNav, setActiveNav] = useState("runs");
  const { legalEntityId } = useEnterpriseStore();
  const { data: payrolls = [] } = useQuery<PayrollRun[]>({
    queryKey: ["/api/payroll/runs", legalEntityId],
    queryFn: () => fetch("/api/payroll/runs", { headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined }).then(r => r.json()),
    retry: false,
  });

  const navItems = [
    { id: "runs", label: "Payroll Runs", icon: Calculator, color: "text-blue-500" },
    { id: "taxes", label: "Tax Config", icon: AlertCircle, color: "text-orange-500" },
    { id: "deductions", label: "Deductions", icon: Settings, color: "text-green-500" },
  ];

  const stats = {
    total: payrolls?.length || 0,
    processed: (payrolls || []).filter((p: PayrollRun) => p.status === "processed").length,
    pending: (payrolls || []).filter((p: PayrollRun) => p.status === "pending").length,
    totalAmount: (payrolls || []).reduce((sum: number, p: PayrollRun) => sum + parseFloat(p.totalAmount || "0"), 0),
  };

  return (
    <StandardPage
      title="Payroll Engine"
      description="Tax calculations and compliance"
      actions={
        <Button><Calculator className="w-4 h-4 mr-2" />Run Payroll</Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.processed}</p>
                <p className="text-xs text-muted-foreground">Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold font-mono">${(stats.totalAmount / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "runs" && (
        <div className="space-y-3">
          {payrolls?.map((run: PayrollRun) => (
            <Card key={run.id} className="hover-elevate cursor-pointer"><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{run.name}</p>
                  <p className="text-sm text-muted-foreground">{run.period}</p></div>
                <Badge>{run.status?.toUpperCase() || 'PENDING'}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "taxes" && (<Card><CardContent className="p-4"><p className="text-muted-foreground">Tax configuration settings</p><Button size="sm" className="mt-4">Configure Tax Rules</Button></CardContent></Card>)}
      {activeNav === "deductions" && (<Card><CardContent className="p-4"><p className="text-muted-foreground">Employee deductions and withholdings</p><Button size="sm" className="mt-4">Manage Deductions</Button></CardContent></Card>)}
    </StandardPage>
  );
}
