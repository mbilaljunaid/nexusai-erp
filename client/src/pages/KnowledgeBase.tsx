import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

export default function KnowledgeBase() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">Self-service articles and documentation</p>
        </div>
        <Button data-testid="button-new-article"><Plus className="h-4 w-4 mr-2" />New Article</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search articles..." className="pl-10" data-testid="input-search" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "How to reset password", views: 1245, category: "Account" },
          { title: "Getting started guide", views: 982, category: "Getting Started" },
          { title: "Billing FAQ", views: 756, category: "Billing" },
          { title: "API documentation", views: 654, category: "API" },
        ].map((article) => (
          <Card key={article.title} className="hover:shadow-lg transition cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold">{article.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{article.category}</p>
              <p className="text-xs text-muted-foreground mt-2">{article.views} views</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
