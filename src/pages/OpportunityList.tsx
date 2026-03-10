import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

export default function OpportunityList() {
  const { toast } = useToast();
  const [newOpp, setNewOpp] = useState({ name: "", account: "", stage: "Prospecting", value: "" });

  const { data: opportunities = [], isLoading } = useQuery<any>({
    queryKey: ["/api/crm/opportunities"],
    queryFn: () => fetch("/api/crm/opportunities").then(r => r.json()),
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
    return colors[stage] || "bg-muted text-foreground";
  };

  const columns = [
    {
      id: "name",
      header: "Name",
      width: "250px",
      cell: (opp: any) => <div className="font-medium text-blue-600 px-2 h-full flex items-center">{opp.name}</div>
    },
    {
      id: "account",
      header: "Account",
      width: "200px",
      cell: (opp: any) => <div className="px-2 h-full flex items-center">{opp.account}</div>
    },
    {
      id: "value",
      header: "Value",
      width: "150px",
      cell: (opp: any) => <div className="font-bold px-2 h-full flex items-center">${opp.value}</div>
    },
    {
      id: "stage",
      header: "Stage",
      width: "150px",
      cell: (opp: any) => (
        <div className="px-2 h-full flex items-center">
          <Badge className={getStageColor(opp.stage)}>{opp.stage}</Badge>
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      width: "100px",
      cell: (opp: any) => (
        <div className="px-2 h-full flex items-center">
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(opp.id); }} aria-label="Delete">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <StandardPage
      title="Opportunities"
      description="Manage your sales pipeline and forecast revenue"
    >

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
          <Button disabled={createMutation.isPending || !newOpp.name} className="w-full" data-testid="button-create-opportunity">
            <Plus className="w-4 h-4 mr-2" /> Create Opportunity
          </Button>
        </CardContent>
      </Card>

      <div className="bg-card w-full rounded-md border shadow-sm">
        <InteractiveSpreadsheet
          data={opportunities}
          columns={columns}
          onChange={() => { }}
          virtualized={true}
          containerHeight="500px"
        />
      </div>
    </StandardPage >
  );
}
