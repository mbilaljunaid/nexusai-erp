import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { ContextualSearch } from "@/components/ContextualSearch";
import { Button } from "@/components/ui/button";

export default function AdvancedSearch() {
  return (
    <StandardPage
      title="Advanceh"
      description="Full-text and faceted search capabilities"
    >
      <Card>
        <CardContent className="pt-6 space-y-3">
          <ContextualSearch
            placeholder="Search all records..."
            fields={[{ key: "query", label: "Search", type: "text" }]}
            onSearch={() => { }}
          />
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" data-testid="button-filter-date">Date Range</Button>
            <Button size="sm" variant="outline" data-testid="button-filter-status">Status</Button>
          </div>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
