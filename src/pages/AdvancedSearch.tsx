import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdvancedSearch() {
  return (
    <StandardPage
      title="Advanceh1>
        <p className="text-muted-foreground mt-1">Full-text and faceted search capabilities</p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Input placeholder="Search all records..." data-testid="input-search-advanced" />
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" data-testid="button-filter-date">Date Range</Button>
            <Button size="sm" variant="outline" data-testid="button-filter-status">Status</Button>
          </div>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
