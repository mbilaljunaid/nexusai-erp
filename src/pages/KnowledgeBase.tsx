import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";

export default function KnowledgeBase() {
  return (
    <StandardPage
      title="Knowled"
      description="Searchable documentation and FAQs"
    >
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Input placeholder="Search knowledge base..." data-testid="input-kb-search" />
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>Total Articles: 342</div>
            <div>Last Updated: Today</div>
          </div>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
