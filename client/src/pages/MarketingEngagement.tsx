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

export default function MarketingEngagement() {
  const { toast } = useToast();
  const [newCampaign, setNewCampaign] = useState({ campaignId: "", type: "email", targetSegment: "all", status: "draft" });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["/api/telecom-campaigns"],
    queryFn: () => fetch("/api/telecom-campaigns").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/telecom-campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecom-campaigns"] });
      setNewCampaign({ campaignId: "", type: "email", targetSegment: "all", status: "draft" });
      toast({ title: "Campaign created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/telecom-campaigns/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecom-campaigns"] });
      toast({ title: "Campaign deleted" });
    },
  });

  const active = campaigns.filter((c: any) => c.status === "active").length;
  const completed = campaigns.filter((c: any) => c.status === "completed").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Megaphone className="h-8 w-8" />
          Marketing & Customer Engagement
        </h1>
        <p className="text-muted-foreground mt-2">Campaigns, promotions, churn prediction, and retention strategies</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Campaigns</p>
            <p className="text-2xl font-bold">{campaigns.length}</p>
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
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-blue-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-gray-600">{campaigns.filter((c: any) => c.status === "draft").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-campaign">
        <CardHeader><CardTitle className="text-base">Create Campaign</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Campaign ID" value={newCampaign.campaignId} onChange={(e) => setNewCampaign({ ...newCampaign, campaignId: e.target.value })} data-testid="input-cid" className="text-sm" />
            <Select value={newCampaign.type} onValueChange={(v) => setNewCampaign({ ...newCampaign, type: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newCampaign.targetSegment} onValueChange={(v) => setNewCampaign({ ...newCampaign, targetSegment: v })}>
              <SelectTrigger data-testid="select-segment" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high-value">High Value</SelectItem>
                <SelectItem value="churn-risk">Churn Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newCampaign.status} onValueChange={(v) => setNewCampaign({ ...newCampaign, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newCampaign)} disabled={createMutation.isPending || !newCampaign.campaignId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Campaigns</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : campaigns.length === 0 ? <p className="text-muted-foreground text-center py-4">No campaigns</p> : campaigns.map((c: any) => (
            <div key={c.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`campaign-${c.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{c.campaignId}</p>
                <p className="text-xs text-muted-foreground">{c.type} • Segment: {c.targetSegment}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-${c.id}`} className="h-7 w-7">
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
