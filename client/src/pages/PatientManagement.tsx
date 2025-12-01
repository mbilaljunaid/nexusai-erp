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

export default function PatientManagement() {
  const { toast } = useToast();
  const [newPatient, setNewPatient] = useState({ mrn: "", name: "", dob: "", gender: "M", status: "active" });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/healthcare-patients"],
    queryFn: () => fetch("/api/healthcare-patients").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/healthcare-patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-patients"] });
      setNewPatient({ mrn: "", name: "", dob: "", gender: "M", status: "active" });
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

  const active = patients.filter((p: any) => p.status === "active").length;
  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Patient Management & Registration
        </h1>
        <p className="text-muted-foreground mt-2">Patient demographics, MRN assignment, insurance verification, and records</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Patients</p>
            <p className="text-2xl font-bold">{patients.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{patients.length - active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active %</p>
            <p className="text-2xl font-bold">{patients.length > 0 ? ((active / patients.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-patient">
        <CardHeader><CardTitle className="text-base">Register Patient</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="MRN" value={newPatient.mrn} onChange={(e) => setNewPatient({ ...newPatient, mrn: e.target.value })} data-testid="input-mrn" className="text-sm" />
            <Input placeholder="Name" value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="DOB" type="date" value={newPatient.dob} onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })} data-testid="input-dob" className="text-sm" />
            <Select value={newPatient.gender} onValueChange={(v) => setNewPatient({ ...newPatient, gender: v })}>
              <SelectTrigger data-testid="select-gender" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
                <SelectItem value="O">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newPatient)} disabled={createMutation.isPending || !newPatient.mrn} size="sm" data-testid="button-register">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Patients</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : patients.length === 0 ? <p className="text-muted-foreground text-center py-4">No patients</p> : patients.map((p: any) => (
            <div key={p.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`patient-${p.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{p.mrn} - {p.name}</p>
                <p className="text-xs text-muted-foreground">{p.dob} • {p.gender}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-${p.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
