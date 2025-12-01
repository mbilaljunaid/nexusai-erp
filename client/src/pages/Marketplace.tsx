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
  const { data: extensions = [] } = useQuery<any[]>({
    queryKey: ["/api/marketplace/extensions"]
  });
  const formMetadata = getFormMetadata("marketplace");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-1">Publish and manage marketplace extensions</p>
        </div>
        <SmartAddButton formMetadata={formMetadata} onClick={() => {}} />
      </div>

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={extensions}
        onFilter={setFilteredExtensions}
      />
      <div className="grid gap-4">
        {[
          { ext: "Custom Integration", downloads: 142, rating: "4.8" }
          { ext: "Advanced Reports", downloads: 89, rating: "4.6" }
        ].map((ext) => (
          <Card key={ext.ext}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{ext.ext}</h3>
              <p className="text-sm text-muted-foreground">{ext.downloads} downloads • ⭐ {ext.rating}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
