import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function SalesPipeline() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOpportunities, setFilteredOpportunities] = useState<any[]>([]);
  const { data: opportunities = [] } = useQuery<any[]>({
    queryKey: ["/api/crm/opportunities"],
  });
  const formMetadata = getFormMetadata("opportunity");

  const stages = [
    { name: "Prospecting", opportunities: 8, value: "$120K" },
    { name: "Qualification", opportunities: 5, value: "$180K" },
    { name: "Needs Analysis", opportunities: 4, value: "$320K" },
    { name: "Proposal", opportunities: 3, value: "$750K" },
    { name: "Negotiation", opportunities: 2, value: "$540K" },
    { name: "Closed Won", opportunities: 6, value: "$1.2M" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1">Kanban view of your opportunities across stages</p>
        </div>
        <SmartAddButton formMetadata={formMetadata} onClick={() => {}} />
      </div>

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={opportunities}
        onFilter={setFilteredOpportunities}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <Card key={stage.name} className="bg-muted/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{stage.name}</CardTitle>
                <Badge>{stage.opportunities}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold">{stage.value}</div>
              <div className="space-y-2">
                {Array(Math.min(stage.opportunities, 3)).fill(0).map((_, i) => (
                  <Card key={i} className="p-3 cursor-move hover:shadow-md transition">
                    <p className="text-sm font-medium">Opportunity {i + 1}</p>
                    <p className="text-xs text-muted-foreground mt-1">$50K - 60% prob</p>
                  </Card>
                ))}
                {stage.opportunities > 3 && (
                  <p className="text-xs text-muted-foreground text-center p-2">+{stage.opportunities - 3} more</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
