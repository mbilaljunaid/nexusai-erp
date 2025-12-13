import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExtensions, setFilteredExtensions] = useState<any[]>([]);
  const { data: extensions = [] } = useQuery<any[]>({ queryKey: ["/api/marketplace/extensions"] });
  const formMetadata = getFormMetadata("marketplace");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-1">Publish and manage marketplace extensions</p>
        </div>
        <SmartAddButton formId="marketplace" formMetadata={formMetadata} />
      </div>

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={extensions}
        onFilter={setFilteredExtensions}
      />
      <div className="grid gap-4">
        {filteredExtensions.length > 0 ? filteredExtensions.map((ext: any) => (
          <Card key={ext.id}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{ext.name}</h3>
              <p className="text-sm text-muted-foreground">{ext.downloads || 0} downloads • {ext.rating || 0}</p>
            </CardContent>
          </Card>
        )) : <p className="text-muted-foreground text-center py-4">No extensions found</p>}
      </div>
    </div>
  );
}
