import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Zap, Code } from "lucide-react";

export default function IntegrationHub() {
  const integrations = [
    { name: "Salesforce", status: "active", lastSync: "2 hours ago", type: "CRM" },
    { name: "HubSpot", status: "active", lastSync: "15 minutes ago", type: "Marketing" },
    { name: "Stripe", status: "active", lastSync: "1 hour ago", type: "Payments" },
    { name: "Slack", status: "error", lastSync: "3 days ago", type: "Communication" },
    { name: "Zapier", status: "active", lastSync: "30 minutes ago", type: "Automation" },
    { name: "Mailchimp", status: "inactive", lastSync: "1 week ago", type: "Email" },
  ];

  const workflows = [
    { id: "WF-001", name: "Lead to Contact Sync", status: "active", trigger: "New Lead Created", actions: 2 },
    { id: "WF-002", name: "Order Notification", status: "active", trigger: "Order Completed", actions: 3 },
    { id: "WF-003", name: "Customer Lifecycle", status: "inactive", trigger: "Customer Status Changed", actions: 4 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integration Hub</h1>
        <p className="text-muted-foreground mt-2">Connect your business systems and automate workflows</p>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration, idx) => (
              <Card key={idx} data-testid={`card-integration-${integration.name.replace(/\s+/g, "-").toLowerCase()}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.type}</p>
                    </div>
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status === "active" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : integration.status === "error" ? (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      ) : null}
                      {integration.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Last sync: {integration.lastSync}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" data-testid={`button-test-${integration.name.replace(/\s+/g, "-").toLowerCase()}`}>
                      Test
                    </Button>
                    <Button size="sm" variant="outline">
                      Config
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4 mt-6">
          <Button data-testid="button-create-workflow" className="mb-4">
            <Zap className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
          {workflows.map((workflow) => (
            <Card key={workflow.id} data-testid={`card-workflow-${workflow.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{workflow.name}</h3>
                    <p className="text-sm text-muted-foreground">Trigger: {workflow.trigger}</p>
                  </div>
                  <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                    {workflow.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{workflow.actions} actions configured</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    Test
                  </Button>
                  <Button size="sm" variant="outline">
                    {workflow.status === "active" ? "Disable" : "Enable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create webhooks to receive real-time events from your integrated systems
              </p>
              <Button data-testid="button-create-webhook">Create Webhook</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["SAP", "Oracle", "NetSuite", "QuickBooks", "ServiceNow", "Jira"].map((app, idx) => (
                  <div key={idx} className="p-4 border rounded-lg hover:bg-muted transition-colors" data-testid={`app-${app.replace(/\s+/g, "-").toLowerCase()}`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{app}</h4>
                      <Button size="sm" variant="outline">
                        Install
                      </Button>
                    </div>
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
