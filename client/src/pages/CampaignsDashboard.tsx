import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CampaignsDashboard() {
  const { toast } = useToast();
  const [newCampaign, setNewCampaign] = useState({ name: "", type: "Email", budget: "", status: "active" });

  const { data: campaigns = [], isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/marketing/campaigns"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/marketing/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });
      setNewCampaign({ name: "", type: "Email", budget: "", status: "active" });
      toast({ title: "Campaign created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/marketing/campaigns/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });
      toast({ title: "Campaign deleted" });
    }
  });

  const active = campaigns.filter((c: any) => c.status === "active").length;
  const completed = campaigns.filter((c: any) => c.status === "completed").length;

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Megaphone className="w-8 h-8" />Marketing Campaigns</h1>
        <p className="text-muted-foreground">Manage marketing initiatives</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Campaigns</p><p className="text-2xl font-bold">{campaigns.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Active</p><p className="text-2xl font-bold text-blue-600">{active}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Completed</p><p className="text-2xl font-bold text-green-600">{completed}</p></CardContent></Card>
      </div>

      <Card data-testid="card-new-campaign">
        <CardHeader><CardTitle className="text-base">Create Campaign</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Name" value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} data-testid="input-name" />
            <Select value={newCampaign.type} onValueChange={(v) => setNewCampaign({ ...newCampaign, type: v })}>
              <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Budget" type="number" value={newCampaign.budget} onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })} data-testid="input-budget" />
            <Select value={newCampaign.status} onValueChange={(v) => setNewCampaign({ ...newCampaign, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newCampaign)} disabled={createMutation.isPending || !newCampaign.name} className="w-full" data-testid="button-create-campaign">
            <Plus className="w-4 h-4 mr-2" /> Create Campaign
          </Button>
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>Campaigns</CardTitle></CardHeader><CardContent><div className="space-y-2">{isLoading ? <p>Loading...</p> : campaigns.length === 0 ? <p className="text-muted-foreground text-center py-4">No campaigns</p> : campaigns.map((c: any) => (<div key={c.id} className="flex justify-between items-center p-3 border rounded hover-elevate" data-testid={`campaign-${c.id}`}><div><p className="font-semibold">{c.name}</p><p className="text-sm text-muted-foreground">Budget: ${c.budget} • Type: {c.type}</p></div><div className="flex gap-2 items-center"><Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge><Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-${c.id}`}><Trash2 className="w-4 h-4" /></Button></div></div>))}</div></CardContent></Card>
    </div>
  );
}
