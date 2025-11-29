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

        <TabsContent value="connectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Connectors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "C001", name: "Salesforce CRM", category: "CRM", status: "connected", lastSync: "2 min ago", records: "2,847" },
                { id: "C002", name: "NetSuite ERP", category: "ERP", status: "connected", lastSync: "5 min ago", records: "15,234" },
                { id: "C003", name: "Slack", category: "Communication", status: "connected", lastSync: "1 min ago", records: "N/A" },
                { id: "C004", name: "Stripe Payments", category: "Payment", status: "connected", lastSync: "3 min ago", records: "1,256" },
                { id: "C005", name: "Google Sheets", category: "Spreadsheet", status: "disconnected", lastSync: "Yesterday", records: "342" },
              ].map((connector) => (
                <div key={connector.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{connector.name}</p>
                      <p className="text-xs text-muted-foreground">{connector.category} • Last sync: {connector.lastSync}</p>
                    </div>
                    <Badge className={connector.status === "connected" ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                      {connector.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{connector.records} records synced</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Flow Pipelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "DF001", name: "CRM to ERP Sync", source: "Salesforce", dest: "NetSuite", frequency: "Real-time", status: "active", records: "1,247" },
                { id: "DF002", name: "Invoice Export", source: "NexusAI", dest: "Quickbooks", frequency: "Daily", status: "active", records: "89" },
                { id: "DF003", name: "Lead Import", source: "Google Sheets", dest: "Salesforce", frequency: "Hourly", status: "active", records: "342" },
                { id: "DF004", name: "Payment Sync", source: "Stripe", dest: "NexusAI", frequency: "Real-time", status: "active", records: "156" },
              ].map((flow) => (
                <div key={flow.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{flow.name}</p>
                      <p className="text-xs text-muted-foreground">{flow.source} → {flow.dest} • {flow.frequency}</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600">active</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{flow.records} records processed</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Keys & Webhooks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <p className="text-sm font-medium mb-2">REST API Endpoints</p>
                <code className="text-xs bg-background p-2 rounded block font-mono">
                  https://api.nexusai.com/v1/...
                </code>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Active Webhooks</p>
                {[
                  { name: "Lead Created", url: "/webhooks/lead-created", events: "Led. Created", lastCall: "2 sec ago" },
                  { name: "Deal Won", url: "/webhooks/deal-won", events: "Opp. Won", lastCall: "5 min ago" },
                  { name: "Invoice Paid", url: "/webhooks/invoice-paid", events: "Invoice Paid", lastCall: "1 hour ago" },
                ].map((webhook) => (
                  <div key={webhook.url} className="border rounded p-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium">{webhook.name}</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">{webhook.url} • Last: {webhook.lastCall}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
