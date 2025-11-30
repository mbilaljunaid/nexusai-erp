import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DigitalRetailLeads() {
  const { toast } = useToast();
  const [newLead, setNewLead] = useState({ leadId: "", name: "", email: "", source: "website", status: "new" });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["/api/auto-leads"],
    queryFn: () => fetch("/api/auto-leads").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/auto-leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-leads"] });
      setNewLead({ leadId: "", name: "", email: "", source: "website", status: "new" });
      toast({ title: "Lead captured" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/auto-leads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-leads"] });
      toast({ title: "Lead deleted" });
    },
  });

  const qualified = leads.filter((l: any) => l.status === "qualified").length;
  const converted = leads.filter((l: any) => l.status === "converted").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="h-8 w-8" />
          Digital Retail & Lead Management
        </h1>
        <p className="text-muted-foreground mt-2">Online showroom, lead capture, CRM pipeline, and sales qualification</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Leads</p>
            <p className="text-2xl font-bold">{leads.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Qualified</p>
            <p className="text-2xl font-bold text-blue-600">{qualified}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Converted</p>
            <p className="text-2xl font-bold text-green-600">{converted}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Conversion %</p>
            <p className="text-2xl font-bold">{leads.length > 0 ? ((converted / leads.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-lead">
        <CardHeader><CardTitle className="text-base">Capture Lead</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Lead ID" value={newLead.leadId} onChange={(e) => setNewLead({ ...newLead, leadId: e.target.value })} data-testid="input-leadid" className="text-sm" />
            <Input placeholder="Name" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} data-testid="input-email" className="text-sm" />
            <Input placeholder="Source" disabled value={newLead.source} data-testid="input-source" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newLead)} disabled={createMutation.isPending || !newLead.leadId} size="sm" data-testid="button-capture">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Leads</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : leads.length === 0 ? <p className="text-muted-foreground text-center py-4">No leads</p> : leads.map((l: any) => (
            <div key={l.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`lead-${l.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.email} • {l.source}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={l.status === "converted" ? "default" : "secondary"} className="text-xs">{l.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(l.id)} data-testid={`button-delete-${l.id}`} className="h-7 w-7">
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
