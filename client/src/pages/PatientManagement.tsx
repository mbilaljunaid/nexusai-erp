import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable } from "@/components/ui/StandardTable";
import { StandardPage } from "@/components/ui/StandardPage";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function PatientManagement() {
  const { toast } = useToast();
  const [newPatient, setNewPatient] = useState({ mrn: "", name: "", dob: "", gender: "M", status: "active" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: patients = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/healthcare-patients"],
    queryFn: () => fetch("/api/healthcare-patients").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/healthcare-patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-patients"] });
      setNewPatient({ mrn: "", name: "", dob: "", gender: "M", status: "active" });
      setIsDialogOpen(false);
      toast({ title: "Patient registered" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/healthcare-patients/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-patients"] });
      toast({ title: "Patient deleted" });
    },
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "mrn",
      header: "MRN",
      cell: ({ row }) => <span className="font-mono">{row.original.mrn}</span>
    },
    {
      accessorKey: "name",
      header: "Patient Name",
      cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>
    },
    {
      accessorKey: "dob",
      header: "DOB",
    },
    {
      accessorKey: "gender",
      header: "Gender",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive"
            onClick={() => deleteMutation.mutate(row.original.id)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <StandardPage
      title="Patient Management & Registration"
      description={`Patient demographics, MRN assignment, insurance verification, and records. Total Patients: ${patients.length}`}
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Register Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
              <DialogDescription>
                Enter patient details to create a new record.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mrn" className="text-right">MRN</Label>
                <Input id="mrn" value={newPatient.mrn} onChange={(e) => setNewPatient({ ...newPatient, mrn: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dob" className="text-right">DOB</Label>
                <Input id="dob" type="date" value={newPatient.dob} onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gender" className="text-right">Gender</Label>
                <Select value={newPatient.gender} onValueChange={(v) => setNewPatient({ ...newPatient, gender: v })}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => createMutation.mutate(newPatient)} disabled={createMutation.isPending || !newPatient.mrn}>
                Register
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <StandardTable
        data={patients}
        columns={columns}
        isLoading={isLoading}
        filterColumn="name"
        filterPlaceholder="Search patients..."
      />
    </StandardPage>
  );
}
