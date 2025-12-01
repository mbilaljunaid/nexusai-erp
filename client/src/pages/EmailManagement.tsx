import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { Mail, Send, Archive, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmailManagement() {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState("campaigns");
  const [newCampaign, setNewCampaign] = useState({ name: "", status: "active", recipients: "" });

  const navItems = [
    { id: "campaigns", label: "Campaigns", icon: Send, color: "text-blue-500" }
    { id: "templates", label: "Templates", icon: Mail, color: "text-purple-500" }
    { id: "subscribers", label: "Subscribers", icon: Users, color: "text-green-500" }
  ];

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["/api/email-campaigns"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/email-campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      setNewCampaign({ name: "", status: "active", recipients: "" });
      toast({ title: "Campaign created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/email-campaigns/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      toast({ title: "Campaign deleted" });
    }
  });

  const calculateStats = (sent: number, opens: number, clicks: number) => ({
    openRate: ((opens / sent) * 100).toFixed(1)
    clickRate: ((clicks / opens) * 100).toFixed(1)
  });

  const templates = [
    { name: "Welcome Email", category: "Onboarding", uses: 324 }
    { name: "Product Update", category: "Product", uses: 156 }
    { name: "Special Offer", category: "Promotion", uses: 89 }
    { name: "Monthly Newsletter", category: "Newsletter", uses: 245 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Mail className="h-8 w-8" />Email Management</h1>
          <p className="text-muted-foreground mt-2">Create, send, and track email campaigns</p>
        </div>
        <Button data-testid="button-new-campaign">
          <Send className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "campaigns" && (
        <div className="space-y-4 p-4">
          <Card data-testid="card-new-campaign">
            <CardHeader><CardTitle className="text-base">Create Email Campaign</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Campaign name" value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} data-testid="input-name" />
                <Input placeholder="Recipients" type="number" value={newCampaign.recipients} onChange={(e) => setNewCampaign({ ...newCampaign, recipients: e.target.value })} data-testid="input-recipients" />
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
          <Card>
            <CardHeader><CardTitle className="text-base">Email Campaigns</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? <p>Loading...</p> : campaigns.length === 0 ? <p className="text-muted-foreground text-center py-4">No campaigns</p> : campaigns.map((campaign: any) => (
                <div key={campaign.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`campaign-${campaign.id}`}>
                  <div>
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <p className="text-sm text-muted-foreground">Recipients: {campaign.recipients} • Sent: {campaign.sent || 0}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant={campaign.status === "active" ? "default" : "secondary"}>{campaign.status}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(campaign.id)} data-testid={`button-delete-${campaign.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "templates" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.name} data-testid={`card-template-${template.name}`}>
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Category: {template.category}</p><p className="text-sm font-semibold mt-2">Used {template.uses} times</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeNav === "subscribers" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Subscriber Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Total subscribers: 45,234</p><p className="text-muted-foreground">Active: 42,123</p><p className="text-muted-foreground">Unsubscribed: 3,111</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
