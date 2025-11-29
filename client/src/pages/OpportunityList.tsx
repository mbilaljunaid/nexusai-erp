import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Download } from "lucide-react";
import { Link } from "wouter";

export default function OpportunityList() {
  const { data: opportunities = [] } = useQuery({
    queryKey: ["/api/opportunities"],
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
          <Button variant="outline" size="icon" data-testid="button-filter">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" data-testid="button-export">
            <Download className="h-4 w-4" />
          </Button>
          <Button data-testid="button-new-opportunity">
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search opportunities..." className="pl-10" data-testid="input-search" />
        </div>
      </div>

      <div className="grid gap-4">
        {[
          { id: 1, name: "Acme Corp - Enterprise Suite", account: "Acme Corp", stage: "Proposal", value: "$250K", prob: "60%", close: "Jan 15" },
          { id: 2, name: "TechStart - SaaS License", account: "TechStart", stage: "Needs Analysis", value: "$80K", prob: "45%", close: "Jan 25" },
          { id: 3, name: "Global Inc - Implementation", account: "Global Inc", stage: "Closed Won", value: "$500K", prob: "100%", close: "Jan 10" },
          { id: 4, name: "StartupXYZ - Pilot Program", account: "StartupXYZ", stage: "Qualification", value: "$30K", prob: "30%", close: "Feb 01" },
        ].map((opp) => (
          <Card key={opp.id} className="hover:bg-muted/50 transition cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link href={`/opportunity/${opp.id}`}>
                    <h3 className="font-semibold text-blue-600 hover:underline">{opp.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">{opp.account}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">Close: {opp.close}</Badge>
                    <Badge variant="secondary">Prob: {opp.prob}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{opp.value}</p>
                  <Badge className={getStageColor(opp.stage)}>{opp.stage}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
