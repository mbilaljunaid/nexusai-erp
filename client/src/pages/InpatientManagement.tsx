import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InpatientManagement() {
  const { toast } = useToast();
  const [newAdmit, setNewAdmit] = useState({ admissionId: "", patientId: "", bedId: "", status: "admitted" });

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ["/api/healthcare-admissions"],
    queryFn: () => fetch("/api/healthcare-admissions").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/healthcare-admissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-admissions"] });
      setNewAdmit({ admissionId: "", patientId: "", bedId: "", status: "admitted" });
      toast({ title: "Admission recorded" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/healthcare-admissions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-admissions"] });
      toast({ title: "Admission deleted" });
    },
  });

  const active = admissions.filter((a: any) => a.status === "admitted").length;
  const discharged = admissions.filter((a: any) => a.status === "discharged").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Inpatient Management & Ward Operations
        </h1>
        <p className="text-muted-foreground mt-2">ADT events, bed management, care rounds, and discharge planning</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Admissions</p>
            <p className="text-2xl font-bold">{admissions.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Admitted</p>
            <p className="text-2xl font-bold text-blue-600">{active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Discharged</p>
            <p className="text-2xl font-bold text-green-600">{discharged}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Bed Occupancy</p>
            <p className="text-2xl font-bold">{admissions.length > 0 ? ((active / admissions.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-admit">
        <CardHeader><CardTitle className="text-base">Record Admission</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Admission ID" value={newAdmit.admissionId} onChange={(e) => setNewAdmit({ ...newAdmit, admissionId: e.target.value })} data-testid="input-admid" className="text-sm" />
            <Input placeholder="Patient ID" value={newAdmit.patientId} onChange={(e) => setNewAdmit({ ...newAdmit, patientId: e.target.value })} data-testid="input-pid" className="text-sm" />
            <Input placeholder="Bed ID" value={newAdmit.bedId} onChange={(e) => setNewAdmit({ ...newAdmit, bedId: e.target.value })} data-testid="input-bid" className="text-sm" />
            <Input placeholder="Ward" disabled className="text-sm" />
            <Button onClick={() => createMutation.mutate(newAdmit)} disabled={createMutation.isPending || !newAdmit.admissionId} size="sm" data-testid="button-admit">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Admissions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : admissions.length === 0 ? <p className="text-muted-foreground text-center py-4">No admissions</p> : admissions.map((a: any) => (
            <div key={a.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`admit-${a.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{a.admissionId}</p>
                <p className="text-xs text-muted-foreground">Patient: {a.patientId} • Bed: {a.bedId}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={a.status === "admitted" ? "default" : "secondary"} className="text-xs">{a.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(a.id)} data-testid={`button-delete-${a.id}`} className="h-7 w-7">
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
