import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Search } from "lucide-react";

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>();

  const { data: apps = [] } = useQuery({
    queryKey: ["/api/marketplace/apps", selectedCategory],
  }) as { data: any[] };

  const installMutation = useMutation({
    mutationFn: (appId: string) =>
      apiRequest("POST", "/api/marketplace/installations", {
        appId,
        tenantId: "default",
        status: "active",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/installations"] });
    },
  });

  const categories = ["integration", "workflow", "analytics", "reporting"];
  const filteredApps = apps.filter(
    (app: any) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || app.category === selectedCategory)
  );

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold" data-testid="title-marketplace">App Marketplace</h1>
        <p className="text-muted-foreground mt-2">Discover and install apps and integrations</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-apps"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedCategory ? "outline" : "default"}
            onClick={() => setSelectedCategory(undefined)}
            data-testid="button-category-all"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              data-testid={`button-category-${cat}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.length > 0 ? (
          filteredApps.map((app: any) => (
            <Card key={app.id} data-testid={`card-app-${app.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-app-name-${app.id}`}>{app.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{app.developer}</p>
                  </div>
                  <Badge variant="outline" data-testid={`badge-category-${app.id}`}>{app.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground" data-testid={`text-description-${app.id}`}>{app.description}</p>

                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(Number(app.rating)) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground" data-testid={`text-rating-${app.id}`}>{app.rating} ({app.installCount} installs)</span>
                </div>

                <Button
                  className="w-full"
                  onClick={() => installMutation.mutate(app.id)}
                  disabled={installMutation.isPending}
                  data-testid={`button-install-${app.id}`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {installMutation.isPending ? "Installing..." : "Install"}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground" data-testid="text-no-apps">
            No apps found matching your criteria
          </p>
        )}
      </div>
    </div>
  );
}
