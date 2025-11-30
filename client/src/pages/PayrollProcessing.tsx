import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PayrollProcessing() {
  const { toast } = useToast();
  const [newPayroll, setNewPayroll] = useState({ month: "", year: "2025", amount: "" });

  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ["/api/payroll/runs"],
    queryFn: () => fetch("/api/payroll/runs").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/payroll/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/runs"] });
      setNewPayroll({ month: "", year: "2025", amount: "" });
      toast({ title: "Payroll run created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/payroll/runs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/runs"] });
      toast({ title: "Payroll deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Processing</h1>
          <p className="text-muted-foreground mt-1">Manage salary processing and payments</p>
        </div>
      </div>

      <Card data-testid="card-process-payroll">
        <CardHeader><CardTitle className="text-base">Process Payroll</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Month" value={newPayroll.month} onChange={(e) => setNewPayroll({ ...newPayroll, month: e.target.value })} data-testid="input-month" />
            <Input placeholder="Year" value={newPayroll.year} onChange={(e) => setNewPayroll({ ...newPayroll, year: e.target.value })} data-testid="input-year" />
            <Input placeholder="Amount" type="number" value={newPayroll.amount} onChange={(e) => setNewPayroll({ ...newPayroll, amount: e.target.value })} data-testid="input-amount" />
          </div>
          <Button onClick={() => createMutation.mutate(newPayroll)} disabled={createMutation.isPending || !newPayroll.month} className="w-full" data-testid="button-process-payroll">
            <Plus className="w-4 h-4 mr-2" /> Process Payroll
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Payroll</p>
            <p className="text-2xl font-bold mt-1">$245,600</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Processed</p>
            <p className="text-2xl font-bold mt-1">$180,400</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold mt-1">$65,200</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Payroll Runs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : payrolls.length === 0 ? <p className="text-muted-foreground text-center py-4">No payroll runs</p> : payrolls.map((run: any) => (
            <div key={run.id} className="flex justify-between items-center p-3 border rounded hover-elevate" data-testid={`payroll-${run.id}`}>
              <div>
                <span className="font-medium text-sm">{run.month} {run.year}</span>
                <p className="text-xs text-muted-foreground">${run.amount}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge className="bg-green-100 text-green-800">Processed</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(run.id)} data-testid={`button-delete-${run.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
