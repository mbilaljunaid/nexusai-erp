import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CompensationManagement() {
  const { toast } = useToast();
  const [newComp, setNewComp] = useState({ employee: "", baseSalary: "", bonus: "", benefits: "" });

  const { data: compensations = [], isLoading } = useQuery({
    queryKey: ["/api/compensation"],
    queryFn: () => fetch("/api/compensation").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/compensation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compensation"] });
      setNewComp({ employee: "", baseSalary: "", bonus: "", benefits: "" });
      toast({ title: "Compensation added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/compensation/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compensation"] });
      toast({ title: "Compensation deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Compensation Management</h1>
        <p className="text-muted-foreground mt-1">Manage employee compensation packages</p>
      </div>

      <Card data-testid="card-new-compensation">
        <CardHeader><CardTitle className="text-base">Add Compensation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Employee" value={newComp.employee} onChange={(e) => setNewComp({ ...newComp, employee: e.target.value })} data-testid="input-employee" />
            <Input placeholder="Base Salary" type="number" value={newComp.baseSalary} onChange={(e) => setNewComp({ ...newComp, baseSalary: e.target.value })} data-testid="input-base" />
            <Input placeholder="Bonus" type="number" value={newComp.bonus} onChange={(e) => setNewComp({ ...newComp, bonus: e.target.value })} data-testid="input-bonus" />
            <Input placeholder="Benefits" type="number" value={newComp.benefits} onChange={(e) => setNewComp({ ...newComp, benefits: e.target.value })} data-testid="input-benefits" />
          </div>
          <Button onClick={() => createMutation.mutate(newComp)} disabled={createMutation.isPending || !newComp.employee} className="w-full" data-testid="button-add-compensation">
            <Plus className="w-4 h-4 mr-2" /> Add Compensation
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? <p>Loading...</p> : compensations.length === 0 ? <p className="text-muted-foreground text-center py-4">No compensation records</p> : compensations.map((emp: any) => (
          <Card key={emp.id} data-testid={`compensation-${emp.id}`} className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{emp.employee}</h3>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(emp.id)} data-testid={`button-delete-${emp.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div><p className="text-muted-foreground">Base</p><p className="font-medium">${emp.baseSalary}</p></div>
                <div><p className="text-muted-foreground">Bonus</p><p className="font-medium">${emp.bonus}</p></div>
                <div><p className="text-muted-foreground">Benefits</p><p className="font-medium">${emp.benefits}</p></div>
                <div><p className="text-muted-foreground">Total</p><p className="font-bold">${parseInt(emp.baseSalary || 0) + parseInt(emp.bonus || 0) + parseInt(emp.benefits || 0)}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
