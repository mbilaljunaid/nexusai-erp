import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Download, Search, Zap, Lock } from "lucide-react";

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [connectorTab, setConnectorTab] = useState("prebuilt");

  const { data: apps = [] } = useQuery({
    queryKey: ["/api/marketplace/apps", selectedCategory],
  }) as { data: any[] };

  const { data: connectors = [] } = useQuery({
    queryKey: ["/api/connectors/prebuilt", selectedCategory],
  }) as { data: any[] };

  const { data: analytics } = useQuery({
    queryKey: ["/api/marketplace/analytics"],
  }) as { data: any };

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

  const connectMutation = useMutation({
    mutationFn: (connector: string) =>
      apiRequest("POST", "/api/oauth/authorize", {
        connector,
        redirectUrl: window.location.origin,
      }),
    onSuccess: (data) => {
      window.open(data.authUrl, "_blank");
    },
  });

  const categories = ["integration", "workflow", "analytics", "reporting"];
  const filteredApps = apps.filter(
    (app: any) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || app.category === selectedCategory)
  );

  const filteredConnectors = connectors.filter(
    (c: any) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || c.category === selectedCategory)
  );

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold" data-testid="title-marketplace">App Marketplace</h1>
        <p className="text-muted-foreground mt-2">Discover and install apps, connectors, and integrations</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalApps}</div>
              <p className="text-xs text-muted-foreground mt-1">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Installs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalInstalls}</div>
              <p className="text-xs text-muted-foreground mt-1">This workspace</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgRating}⭐</div>
              <p className="text-xs text-muted-foreground mt-1">Community rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(analytics.revenue.thisMonth / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        </div>
      )}

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

      <Tabs value={connectorTab} onValueChange={setConnectorTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prebuilt">Pre-Built Connectors</TabsTrigger>
          <TabsTrigger value="apps">Marketplace Apps</TabsTrigger>
        </TabsList>

        <TabsContent value="prebuilt" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnectors.length > 0 ? (
              filteredConnectors.map((connector: any) => (
                <Card key={connector.name} data-testid={`card-connector-${connector.name}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{connector.icon}</span>
                        <div>
                          <CardTitle className="text-lg" data-testid={`text-connector-name-${connector.name}`}>{connector.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">{connector.category}</p>
                        </div>
                      </div>
                      {connector.oauthEnabled && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground" data-testid={`text-connector-desc-${connector.name}`}>{connector.description}</p>
                    <Button
                      className="w-full"
                      onClick={() => connectMutation.mutate(connector.name)}
                      disabled={connectMutation.isPending}
                      data-testid={`button-connect-${connector.name}`}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {connectMutation.isPending ? "Connecting..." : "Connect"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">No connectors found</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="apps" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
