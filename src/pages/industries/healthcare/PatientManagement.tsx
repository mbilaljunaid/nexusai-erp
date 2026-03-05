import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
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
import { DatePicker } from '@/components/ui/DatePicker';

export default function PatientManagement() {
  const { toast } = useToast();
  const [newPatient, setNewPatient] = useState({ mrn: "", name: "", dob: "", gender: "M", status: "active" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: patients = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/healthcare-patients"],
    queryFn: () => fetch("/api/healthcare-patients").then(r => r.json()),
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

  const columns: SpreadsheetColumn<any>[] = [
    {
      id: "mrn",
      header: "MRN",
      width: "15%",
      cell: (item: any) => <div className="p-2 font-mono">{item.mrn}</div>
    },
    {
      id: "name",
      header: "Patient Name",
      width: "30%",
      cell: (item: any) => <div className="p-2 font-semibold">{item.name}</div>
    },
    {
      id: "dob",
      header: "DOB",
      width: "15%",
      cell: (item: any) => <div className="p-2">{item.dob}</div>
    },
    {
      id: "gender",
      header: "Gender",
      width: "15%",
      cell: (item: any) => <div className="p-2">{item.gender}</div>
    },
    {
      id: "status",
      header: "Status",
      width: "15%",
      cell: (item: any) => (
        <div className="p-2">
          <Badge variant={item.status === "active" ? "default" : "secondary"}>
            {item.status}
          </Badge>
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      width: "10%",
      cell: (item: any) => (
        <div className="p-2 flex gap-2 justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive"
            onClick={() => deleteMutation.mutate(item.id)}
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
                <DatePicker className="col-span-3" value={newPatient.dob} onChange={(v) => setNewPatient({ ...newPatient, dob: v })} />
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
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="border rounded-md">
          <InteractiveSpreadsheet
            data={patients}
            columns={columns}
            virtualized={true}
            containerHeight="600px"
            onChange={() => { }}
          />
        </div>
      )}
    </StandardPage>
  );
}
