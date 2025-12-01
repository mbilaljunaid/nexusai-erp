import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function OrgChart() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrg, setFilteredOrg] = useState<any[]>([]);
  const { data: orgData = [] } = useQuery<any[]>({
    queryKey: ["/api/org"],
  });
  const formMetadata = getFormMetadata("orgChart");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div>
        <h1 className="text-3xl font-bold">Organization Chart</h1>
        <p className="text-muted-foreground mt-1">View company hierarchy and reporting structure</p>
      </div>

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={orgData}
        onFilter={setFilteredOrg}
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Company Structure</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4 font-mono text-sm">
            {[
              { name: "CEO - John Doe", level: 0 },
              { name: "├─ VP Sales - Alice Johnson", level: 1 },
              { name: "│  ├─ Sales Manager - Tom", level: 2 },
              { name: "│  └─ Sales Manager - Jane", level: 2 },
              { name: "├─ VP Engineering - Bob Smith", level: 1 },
              { name: "│  ├─ Tech Lead - Mike", level: 2 },
              { name: "│  └─ Tech Lead - Sarah", level: 2 },
              { name: "└─ VP Operations - Eve Martinez", level: 1 },
              { name: "   ├─ Manager - Frank", level: 2 },
              { name: "   └─ Manager - Grace", level: 2 },
            ].map((item, idx) => (
              <div key={idx} className="p-2 border rounded bg-muted/50">{item.name}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
