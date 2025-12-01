import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Plus } from "lucide-react";

export default function OpportunitiesPage() {
  const opportunities = [
    { id: "op1", name: "Acme Cloud Migration", customer: "Acme Corp", stage: "proposal", value: "$250,000", probability: "70%", owner: "Alice", closeDate: "2025-12-15" }
    { id: "op2", name: "Global ERP Implementation", customer: "Global Industries", stage: "negotiation", value: "$500,000", probability: "60%", owner: "Bob", closeDate: "2025-11-30" }
    { id: "op3", name: "StartUp Platform Upgrade", customer: "StartUp Labs", stage: "qualification", value: "$75,000", probability: "40%", owner: "Carol", closeDate: "2026-01-15" }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Target className="h-8 w-8" />
          Sales Opportunities
        </h1>
        <p className="text-muted-foreground mt-2">Track and manage sales opportunities</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-add-opportunity">
            <Plus className="h-4 w-4" />
            New Opportunity
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Pipeline</p><p className="text-2xl font-bold">$825K</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Qualified</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Expected Win</p><p className="text-2xl font-bold text-green-600">$619K</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Avg Probability</p><p className="text-2xl font-bold">56%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Opportunities</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {opportunities.map((opp) => (
            <div key={opp.id} className="p-3 border rounded-lg hover-elevate" data-testid={`opportunity-${opp.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{opp.name}</h3>
                <Badge variant="outline">{opp.stage}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Customer: {opp.customer} • Value: {opp.value} • Probability: {opp.probability} • Owner: {opp.owner} • Close: {opp.closeDate}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
