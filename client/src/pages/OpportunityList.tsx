import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OpportunityList() {
  const { toast } = useToast();
  const [newOpp, setNewOpp] = useState({ name: "", account: "", stage: "Prospecting", value: "" });

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["/api/crm/opportunities"],
    queryFn: () => fetch("/api/crm/opportunities").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/crm/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] });
      setNewOpp({ name: "", account: "", stage: "Prospecting", value: "" });
      toast({ title: "Opportunity created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/crm/opportunities/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] });
      toast({ title: "Opportunity deleted" });
    },
  });

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      "Prospecting": "bg-blue-100 text-blue-800",
      "Qualification": "bg-cyan-100 text-cyan-800",
      "Needs Analysis": "bg-purple-100 text-purple-800",
      "Proposal": "bg-amber-100 text-amber-800",
      "Negotiation": "bg-orange-100 text-orange-800",
      "Closed Won": "bg-green-100 text-green-800",
      "Closed Lost": "bg-red-100 text-red-800",
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground mt-1">Manage your sales pipeline and forecast revenue</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" data-testid="button-filter"><Filter className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" data-testid="button-export"><Download className="h-4 w-4" /></Button>
        </div>
      </div>

      <Card data-testid="card-new-opportunity">
        <CardHeader><CardTitle className="text-base">Create Opportunity</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Name" value={newOpp.name} onChange={(e) => setNewOpp({ ...newOpp, name: e.target.value })} data-testid="input-name" />
            <Input placeholder="Account" value={newOpp.account} onChange={(e) => setNewOpp({ ...newOpp, account: e.target.value })} data-testid="input-account" />
            <Input placeholder="Value" type="number" value={newOpp.value} onChange={(e) => setNewOpp({ ...newOpp, value: e.target.value })} data-testid="input-value" />
            <Select value={newOpp.stage} onValueChange={(v) => setNewOpp({ ...newOpp, stage: v })}>
              <SelectTrigger data-testid="select-stage"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Prospecting">Prospecting</SelectItem>
                <SelectItem value="Qualification">Qualification</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Closed Won">Closed Won</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newOpp)} disabled={createMutation.isPending || !newOpp.name} className="w-full" data-testid="button-create-opportunity">
            <Plus className="w-4 h-4 mr-2" /> Create Opportunity
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search opportunities..." className="pl-10" data-testid="input-search" />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? <p>Loading...</p> : opportunities.length === 0 ? <p className="text-muted-foreground">No opportunities</p> : (opportunities.map((opp: any) => (
          <Card key={opp.id} className="hover:bg-muted/50 transition" data-testid={`opportunity-${opp.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-600">{opp.name}</h3>
                  <p className="text-sm text-muted-foreground">{opp.account}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="text-xl font-bold">${opp.value}</p>
                  <Badge className={getStageColor(opp.stage)}>{opp.stage}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(opp.id)} data-testid={`button-delete-${opp.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>
    </div>
  );
}
