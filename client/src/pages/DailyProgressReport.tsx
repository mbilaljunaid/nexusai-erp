import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DailyProgressReport() {
  const { toast } = useToast();
  const [newDPR, setNewDPR] = useState({ date: new Date().toISOString().split('T')[0], progress: "50", manHours: "100", materialUsed: "500", status: "submitted" });

  const { data: dprs = [], isLoading } = useQuery({
    queryKey: ["/api/dpr"],
    queryFn: () => fetch("/api/dpr").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/dpr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dpr"] });
      setNewDPR({ date: new Date().toISOString().split('T')[0], progress: "50", manHours: "100", materialUsed: "500", status: "submitted" });
      toast({ title: "DPR submitted" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/dpr/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dpr"] });
      toast({ title: "DPR deleted" });
    },
  });

  const approved = dprs.filter((d: any) => d.status === "approved").length;
  const avgProgress = dprs.length > 0 ? (dprs.reduce((sum: number, d: any) => sum + (parseFloat(d.progress) || 0), 0) / dprs.length).toFixed(0) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Daily Progress Report (DPR)
        </h1>
        <p className="text-muted-foreground mt-2">Site progress, material consumption, and man-hours tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total DPRs</p>
            <p className="text-2xl font-bold">{dprs.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approved}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Progress</p>
            <p className="text-2xl font-bold">{avgProgress}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Man-Hours</p>
            <p className="text-2xl font-bold">{(dprs.reduce((sum: number, d: any) => sum + (parseFloat(d.manHours) || 0), 0) / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-dpr">
        <CardHeader><CardTitle className="text-base">Submit DPR</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input type="date" value={newDPR.date} onChange={(e) => setNewDPR({ ...newDPR, date: e.target.value })} data-testid="input-date" className="text-sm" />
            <Input placeholder="Progress %" type="number" min="0" max="100" value={newDPR.progress} onChange={(e) => setNewDPR({ ...newDPR, progress: e.target.value })} data-testid="input-progress" className="text-sm" />
            <Input placeholder="Man-Hours" type="number" value={newDPR.manHours} onChange={(e) => setNewDPR({ ...newDPR, manHours: e.target.value })} data-testid="input-mh" className="text-sm" />
            <Input placeholder="Material Used" type="number" value={newDPR.materialUsed} onChange={(e) => setNewDPR({ ...newDPR, materialUsed: e.target.value })} data-testid="input-mat" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newDPR)} disabled={createMutation.isPending} size="sm" data-testid="button-submit-dpr">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">DPRs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : dprs.length === 0 ? <p className="text-muted-foreground text-center py-4">No DPRs</p> : dprs.map((d: any) => (
            <div key={d.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`dpr-${d.id}`}>
              <div>
                <p className="font-semibold">{d.date}</p>
                <p className="text-xs text-muted-foreground">{d.progress}% • {d.manHours}h • ${d.materialUsed} material</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={d.status === "approved" ? "default" : "secondary"} className="text-xs">{d.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(d.id)} data-testid={`button-delete-${d.id}`} className="h-7 w-7">
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
