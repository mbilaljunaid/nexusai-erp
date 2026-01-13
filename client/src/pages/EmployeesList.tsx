import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Users } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable } from "@/components/ui/StandardTable";
import { StandardPage } from "@/components/layout/StandardPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function EmployeesList() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({ firstName: "", lastName: "", department: "", designation: "" });

  const { data: employees = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hr/employees"],
    queryFn: () => fetch("/api/hr/employees").then(r => r.json()).catch(() => [])
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hr/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/employees"] });
      setNewEmp({ firstName: "", lastName: "", department: "", designation: "" });
      setIsDialogOpen(false);
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

  const columns = [
    {
      header: "Details",
      accessorKey: "firstName",
      cell: (emp: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
              {emp.firstName.substring(0, 1)}{emp.lastName.substring(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{emp.firstName} {emp.lastName}</div>
            <div className="text-xs text-muted-foreground">{emp.email || 'no-email@example.com'}</div>
          </div>
        </div>
      )
    },
    {
      header: "Department",
      accessorKey: "department",
      cell: (emp: any) => (
        <div className="font-medium">{emp.department}</div>
      )
    },
    {
      header: "Designation",
      accessorKey: "designation",
      cell: (emp: any) => (
        <span className="text-sm">{emp.designation}</span>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (emp: any) => (
        <Badge variant={emp.status === "active" ? "default" : "secondary"}>{emp.status || 'Active'}</Badge>
      )
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (emp: any) => (
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(emp.id); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <StandardPage
      title="Employees"
      breadcrumbs={[{ label: "HR", href: "/hr" }, { label: "Employees" }]}
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="First Name" value={newEmp.firstName} onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })} />
              <Input placeholder="Last Name" value={newEmp.lastName} onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })} />
              <Input placeholder="Department" value={newEmp.department} onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })} />
              <Input placeholder="Designation" value={newEmp.designation} onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })} />
              <Button onClick={() => createMutation.mutate(newEmp)} disabled={createMutation.isPending || !newEmp.firstName}>
                {createMutation.isPending ? "Creating..." : "Create Employee"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <StandardTable
        data={employees}
        columns={columns}
        keyExtractor={(item) => item.id}
        filterColumn="firstName"
        filterPlaceholder="Filter by name..."
      />
    </StandardPage>
  );
}
