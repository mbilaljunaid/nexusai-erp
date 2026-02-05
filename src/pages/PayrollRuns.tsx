import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

export default function PayrollRuns() {
  const { data: payrollRuns = [] } = useQuery<any[]>({ queryKey: ["/api/hr/payroll-runs"] });

  const totalAmount = payrollRuns.reduce((sum, r: any) => sum + parseFloat(r.totalAmount || 0), 0);
  const processedCount = payrollRuns.filter((r: any) => r.status === "processed").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <DollarSign className="w-8 h-8" />
          Payroll Processing
        </h1>
        <p className="text-muted-foreground">Process salary and compensation</p>
      </div>

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
    </div>
  );
}
