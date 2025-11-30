import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Hammer, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ToolingManagement() {
  const { toast } = useToast();
  const [newTool, setNewTool] = useState({ toolId: "", toolType: "cutting", status: "calibrated", usageCount: "0" });

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ["/api/tooling"],
    queryFn: () => fetch("/api/tooling").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/tooling", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tooling"] });
      setNewTool({ toolId: "", toolType: "cutting", status: "calibrated", usageCount: "0" });
      toast({ title: "Tool created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/tooling/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tooling"] });
      toast({ title: "Tool deleted" });
    },
  });

  const calibrated = tools.filter((t: any) => t.status === "calibrated").length;
  const needsCalibration = tools.filter((t: any) => t.status === "due-for-calibration").length;
  const totalUsage = tools.reduce((sum: number, t: any) => sum + (parseFloat(t.usageCount) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Hammer className="h-8 w-8" />
          Tooling & Fixture Management
        </h1>
        <p className="text-muted-foreground mt-2">Tool tracking, calibration, certification, and lifecycle management</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Tools</p>
            <p className="text-2xl font-bold">{tools.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Calibrated</p>
            <p className="text-2xl font-bold text-green-600">{calibrated}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Due for Calibration</p>
            <p className="text-2xl font-bold text-yellow-600">{needsCalibration}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Usage</p>
            <p className="text-2xl font-bold">{totalUsage}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-tool">
        <CardHeader><CardTitle className="text-base">Register Tool</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Tool ID" value={newTool.toolId} onChange={(e) => setNewTool({ ...newTool, toolId: e.target.value })} data-testid="input-toolid" className="text-sm" />
            <Select value={newTool.toolType} onValueChange={(v) => setNewTool({ ...newTool, toolType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cutting">Cutting</SelectItem>
                <SelectItem value="fixture">Fixture</SelectItem>
                <SelectItem value="gauge">Gauge</SelectItem>
                <SelectItem value="jig">Jig</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newTool.status} onValueChange={(v) => setNewTool({ ...newTool, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="calibrated">Calibrated</SelectItem>
                <SelectItem value="due-for-calibration">Due</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Usage Count" type="number" value={newTool.usageCount} onChange={(e) => setNewTool({ ...newTool, usageCount: e.target.value })} data-testid="input-usage" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newTool)} disabled={createMutation.isPending || !newTool.toolId} size="sm" data-testid="button-add-tool">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Tool Registry</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : tools.length === 0 ? <p className="text-muted-foreground text-center py-4">No tools</p> : tools.map((t: any) => (
            <div key={t.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`tool-${t.id}`}>
              <div>
                <p className="font-semibold">{t.toolId}</p>
                <p className="text-xs text-muted-foreground">{t.toolType} • Usage: {t.usageCount}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={t.status === "calibrated" ? "default" : t.status === "due-for-calibration" ? "secondary" : "destructive"} className="text-xs">{t.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(t.id)} data-testid={`button-delete-${t.id}`} className="h-7 w-7">
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
