import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SLAServiceTierManagement() {
  const { toast } = useToast();
  const [newSLA, setNewSLA] = useState({ slaId: "", tier: "gold", uptime: "99.9", responseTime: "1" });

  const { data: slas = [], isLoading } = useQuery({
    queryKey: ["/api/sla-tiers"],
    queryFn: () => fetch("/api/sla-tiers").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/sla-tiers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sla-tiers"] });
      setNewSLA({ slaId: "", tier: "gold", uptime: "99.9", responseTime: "1" });
      toast({ title: "SLA tier created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/sla-tiers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sla-tiers"] });
      toast({ title: "SLA deleted" });
    },
  });

  const met = slas.filter((s: any) => s.compliance === "met").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckCircle className="h-8 w-8" />
          SLA & Service Tier Management
        </h1>
        <p className="text-muted-foreground mt-2">Service level agreements, uptime targets, and tier definitions</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total SLAs</p>
            <p className="text-2xl font-bold">{slas.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Met</p>
            <p className="text-2xl font-bold text-green-600">{met}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Violated</p>
            <p className="text-2xl font-bold text-red-600">{slas.length - met}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Compliance %</p>
            <p className="text-2xl font-bold">{slas.length > 0 ? ((met / slas.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-sla">
        <CardHeader><CardTitle className="text-base">Create SLA Tier</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="SLA ID" value={newSLA.slaId} onChange={(e) => setNewSLA({ ...newSLA, slaId: e.target.value })} data-testid="input-slaid" className="text-sm" />
            <Select value={newSLA.tier} onValueChange={(v) => setNewSLA({ ...newSLA, tier: v })}>
              <SelectTrigger data-testid="select-tier" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Uptime %" type="number" value={newSLA.uptime} onChange={(e) => setNewSLA({ ...newSLA, uptime: e.target.value })} data-testid="input-uptime" className="text-sm" />
            <Input placeholder="Response Time (h)" type="number" value={newSLA.responseTime} onChange={(e) => setNewSLA({ ...newSLA, responseTime: e.target.value })} data-testid="input-rtime" className="text-sm" />
            <Button disabled={createMutation.isPending || !newSLA.slaId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">SLAs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : slas.length === 0 ? <p className="text-muted-foreground text-center py-4">No SLAs</p> : slas.map((s: any) => (
            <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`sla-${s.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{s.slaId} - {s.tier}</p>
                <p className="text-xs text-muted-foreground">Uptime: {s.uptime}% • Response: {s.responseTime}h</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={s.compliance === "met" ? "default" : "destructive"} className="text-xs">{s.compliance}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${s.id}`} className="h-7 w-7">
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
