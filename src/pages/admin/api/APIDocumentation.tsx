import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { StandardPage } from "@/components/layout/StandardPage";


export default function APIDocumentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const { data: docs = [] } = useQuery<any[]>({ queryKey: ["/api/docs"] });
  const formMetadata = getFormMetadata("apiDocumentation");

  return (
    <StandardPage title="API Documentation">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={docs} onFilter={setFiltered} />
      
      <div>
        
        <p className="text-muted-foreground mt-1">View and manage API documentation</p>
      </div>
      <div className="grid gap-4">
        {[
          { endpoint: "GET /api/leads", version: "v1" },
          { endpoint: "POST /api/deals", version: "v1" },
        ].map((ep) => (
          <Card key={ep.endpoint}>
            <CardContent className="pt-6">
              <p className="font-mono text-sm">{ep.endpoint}</p>
              <p className="text-xs text-muted-foreground mt-1">Version: {ep.version}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
