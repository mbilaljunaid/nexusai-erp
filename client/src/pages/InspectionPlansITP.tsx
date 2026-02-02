import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InspectionPlansITP() {
  const { toast } = useToast();
  const [newITP, setNewITP] = useState({ partNumber: "", itpType: "incoming", sampleSize: "5", status: "active" });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["/api/inspection-plans"],
    queryFn: () => fetch("/api/inspection-plans").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/inspection-plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspection-plans"] });
      setNewITP({ partNumber: "", itpType: "incoming", sampleSize: "5", status: "active" });
      toast({ title: "Inspection plan created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/inspection-plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspection-plans"] });
      toast({ title: "Plan deleted" });
    },
  });

  const active = plans.filter((p: any) => p.status === "active").length;
  const avgSampleSize = plans.length > 0 ? (plans.reduce((sum: number, p: any) => sum + (parseFloat(p.sampleSize) || 0), 0) / plans.length).toFixed(0) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Eye className="h-8 w-8" />
          Inspection Plans & ITP Management
        </h1>
        <p className="text-muted-foreground mt-2">Incoming, in-process, final inspections, and SPC monitoring</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Plans</p>
            <p className="text-2xl font-bold">{plans.length}</p>
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
            <p className="text-xs text-muted-foreground">Avg Sample Size</p>
            <p className="text-2xl font-bold">{avgSampleSize}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{plans.length - active}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-itp">
        <CardHeader><CardTitle className="text-base">Create Inspection Plan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Part Number" value={newITP.partNumber} onChange={(e) => setNewITP({ ...newITP, partNumber: e.target.value })} data-testid="input-part" className="text-sm" />
            <Select value={newITP.itpType} onValueChange={(v) => setNewITP({ ...newITP, itpType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="in-process">In-Process</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Sample Size" type="number" value={newITP.sampleSize} onChange={(e) => setNewITP({ ...newITP, sampleSize: e.target.value })} data-testid="input-sample" className="text-sm" />
            <Select value={newITP.status} onValueChange={(v) => setNewITP({ ...newITP, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={createMutation.isPending || !newITP.partNumber} size="sm" data-testid="button-create-plan">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Inspection Plans</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : plans.length === 0 ? <p className="text-muted-foreground text-center py-4">No plans</p> : plans.map((p: any) => (
            <div key={p.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`plan-${p.id}`}>
              <div>
                <p className="font-semibold">{p.partNumber}</p>
                <p className="text-xs text-muted-foreground">{p.itpType} • Sample: {p.sampleSize}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${p.id}`} className="h-7 w-7">
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
