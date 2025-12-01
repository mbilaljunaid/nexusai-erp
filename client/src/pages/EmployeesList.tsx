import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmployeesList() {
  const { toast } = useToast();
  const [newEmp, setNewEmp] = useState({ firstName: "", lastName: "", department: "", designation: "" });

  const { data: employees = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/hr/employees"], queryFn: () => fetch("/api/hr/employees").then(r => r.json()).catch(() => []) });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hr/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/employees"] });
      setNewEmp({ firstName: "", lastName: "", department: "", designation: "" });
      toast({ title: "Employee added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hr/employees/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/employees"] });
      toast({ title: "Employee deleted" });
    },
  });

  const activeCount = employees.filter((e: any) => e.status === "active").length;
  const totalCount = employees.length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="w-8 h-8" />
          Employee Directory
        </h1>
        <p className="text-muted-foreground">Manage your workforce</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Employees</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-employee">
        <CardHeader><CardTitle className="text-base">Add Employee</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="First name" value={newEmp.firstName} onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })} data-testid="input-first-name" />
            <Input placeholder="Last name" value={newEmp.lastName} onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })} data-testid="input-last-name" />
            <Input placeholder="Department" value={newEmp.department} onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })} data-testid="input-department" />
            <Input placeholder="Designation" value={newEmp.designation} onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })} data-testid="input-designation" />
          </div>
          <Button onClick={() => createMutation.mutate(newEmp)} disabled={createMutation.isPending || !newEmp.firstName} className="w-full" data-testid="button-add-employee">
            <Plus className="w-4 h-4 mr-2" /> Add Employee
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Employees</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : employees.length === 0 ? <p className="text-muted-foreground text-center py-4">No employees</p> : employees.map((emp: any) => (
            <div key={emp.id} className="flex items-center justify-between p-3 border rounded hover-elevate" data-testid={`employee-${emp.id}`}>
              <div>
                <p className="font-semibold">{emp.firstName} {emp.lastName}</p>
                <p className="text-sm text-muted-foreground">{emp.department} • {emp.designation}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={emp.status === "active" ? "default" : "secondary"}>{emp.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(emp.id)} data-testid={`button-delete-${emp.id}`}>
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
