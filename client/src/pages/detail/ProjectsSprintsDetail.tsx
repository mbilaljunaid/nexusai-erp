import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContextualSearch } from "@/components/ContextualSearch";
import { generateBreadcrumbs, getSearchFields } from "@/lib/pageConfig";

export default function ProjectsSprintsDetail() {
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({});
  const [items] = useState([]);

  const filteredItems = items.filter((item: any) => {
    return true;
  });

  const breadcrumbs = generateBreadcrumbs("ProjectsSprints", "Overview");
  const searchFields = getSearchFields("ProjectsSprints");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Overview</h1>
          <p className="text-muted-foreground text-sm">Manage overview</p>
        </div>
        <Button data-testid="button-new-item">
          <Plus className="h-4 w-4 mr-2" />
          New Item
        </Button>
      </div>

      <ContextualSearch
        fields={searchFields}
        onSearch={setSearchFilters}
        placeholder="Search..."
        testId="search-items"
      />

      <div className="space-y-2">
        {filteredItems.map((item: any) => (
          <Card key={item.id} className="hover-elevate">
            <CardContent className="p-4">
              <p className="font-semibold">No items yet</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
