import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LeadConversion() {
  const { toast } = useToast();
  const [newLead, setNewLead] = useState({ name: "", email: "", company: "", status: "new" });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["/api/crm/leads"],
    queryFn: () => fetch("/api/crm/leads").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/crm/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      setNewLead({ name: "", email: "", company: "", status: "new" });
      toast({ title: "Lead created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/crm/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      toast({ title: "Lead deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Lead Management & Conversion</h1>
        <p className="text-muted-foreground mt-1">Manage leads and convert them to opportunities</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total Leads</p><p className="text-2xl font-bold">{leads.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Qualified</p><p className="text-2xl font-bold text-green-600">{leads.filter((l: any) => l.status === "qualified").length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">In Progress</p><p className="text-2xl font-bold text-blue-600">{leads.filter((l: any) => l.status === "contacted").length}</p></CardContent></Card>
      </div>

      <Card data-testid="card-new-lead">
        <CardHeader><CardTitle className="text-base">Add New Lead</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Name" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} data-testid="input-name" />
            <Input placeholder="Email" type="email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} data-testid="input-email" />
            <Input placeholder="Company" value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} data-testid="input-company" />
            <Select value={newLead.status} onValueChange={(v) => setNewLead({ ...newLead, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newLead)} disabled={createMutation.isPending || !newLead.name} className="w-full" data-testid="button-create-lead">
            <Plus className="w-4 h-4 mr-2" /> Add Lead
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Leads</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : leads.length === 0 ? <p className="text-muted-foreground text-center py-4">No leads</p> : (
            leads.map((lead: any) => (
              <div key={lead.id} className="flex items-center justify-between p-3 border rounded hover-elevate" data-testid={`lead-${lead.id}`}>
                <div>
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.email} • {lead.company}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge>{lead.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(lead.id)} data-testid={`button-delete-${lead.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
