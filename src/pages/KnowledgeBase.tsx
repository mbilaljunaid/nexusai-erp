import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { ContextualSearch } from "@/components/ContextualSearch";

export default function KnowledgeBase() {
  return (
    <StandardPage
      title="Knowled"
      description="Searchable documentation and FAQs"
    >
      <Card>
        <CardContent className="pt-6 space-y-3">
          <ContextualSearch
            placeholder="Search knowledge base..."
            fields={[{ key: "query", label: "Search", type: "text" }]}
            onSearch={() => { }}
          />
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>Total Articles: 342</div>
            <div>Last Updated: Today</div>
          </div>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
