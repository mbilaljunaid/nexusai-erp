import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Integrations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Integration Hub</h1>
        <p className="text-muted-foreground text-sm">Connect to external systems and automate data flows</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="connectors" data-testid="tab-connectors">Connectors</TabsTrigger>
          <TabsTrigger value="flows" data-testid="tab-flows">Data Flows</TabsTrigger>
          <TabsTrigger value="api" data-testid="tab-api">API & Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">18</p>
                  <p className="text-xs text-muted-foreground">Active Connectors</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">42</p>
                  <p className="text-xs text-muted-foreground">Data Flows</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">99.9%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">2.1M</p>
                  <p className="text-xs text-muted-foreground">Records/Month</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Salesforce", category: "CRM" },
                { name: "NetSuite", category: "ERP" },
                { name: "SAP", category: "ERP" },
                { name: "Slack", category: "Communication" },
                { name: "Microsoft Teams", category: "Communication" },
                { name: "Quickbooks", category: "Accounting" },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-3 rounded-md border">
                  <div>
                    <p className="font-medium text-sm">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.category}</p>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connectors">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connector Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Connector module coming soon. Connect and manage third-party integrations.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Flows</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Data flow module coming soon. Create and monitor automated data synchronization.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API & Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">API module coming soon. Build custom integrations using REST APIs and webhooks.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
