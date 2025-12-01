import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { AlertCircle, CheckCircle, Zap, Code, Plug, Webhook } from "lucide-react";

export default function IntegrationHub() {
  const [activeNav, setActiveNav] = useState("integrations");

  const navItems = [
    { id: "integrations", label: "Integrations", icon: Plug, color: "text-blue-500" }
    { id: "workflows", label: "Workflows", icon: Zap, color: "text-purple-500" }
    { id: "webhooks", label: "Webhooks", icon: Webhook, color: "text-green-500" }
    { id: "marketplace", label: "Marketplace", icon: Code, color: "text-orange-500" }
  ];

  const integrations = [
    { name: "Salesforce", status: "active", lastSync: "2 hours ago", type: "CRM" }
    { name: "HubSpot", status: "active", lastSync: "15 minutes ago", type: "Marketing" }
    { name: "Stripe", status: "active", lastSync: "1 hour ago", type: "Payments" }
    { name: "Slack", status: "error", lastSync: "3 days ago", type: "Communication" }
    { name: "Zapier", status: "active", lastSync: "30 minutes ago", type: "Automation" }
    { name: "Mailchimp", status: "inactive", lastSync: "1 week ago", type: "Email" }
  ];

  const workflows = [
    { id: "WF-001", name: "Lead to Contact Sync", status: "active", trigger: "New Lead Created", actions: 2 }
    { id: "WF-002", name: "Order Notification", status: "active", trigger: "Order Completed", actions: 3 }
    { id: "WF-003", name: "Customer Lifecycle", status: "inactive", trigger: "Customer Status Changed", actions: 4 }
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
        <h1 className="text-3xl font-bold flex items-center gap-2"><Plug className="h-8 w-8" />Integration Hub</h1>
        <p className="text-muted-foreground mt-2">Connect your business systems and automate workflows</p>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "integrations" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration, idx) => (
              <Card key={idx} data-testid={`card-integration-${integration.name.replace(/\s+/g, "-").toLowerCase()}`} className="hover-elevate cursor-pointer">
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
                    <Button size="sm" variant="outline" data-testid={`button-test-${integration.name.replace(/\s+/g, "-").toLowerCase()}`}>Test</Button>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeNav === "workflows" && (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} data-testid={`card-workflow-${workflow.id}`} className="hover-elevate cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{workflow.name}</h3>
                    <p className="text-sm text-muted-foreground">Trigger: {workflow.trigger}</p>
                    <p className="text-xs text-muted-foreground mt-1">Actions: {workflow.actions}</p>
                  </div>
                  <Badge variant={workflow.status === "active" ? "default" : "secondary"}>{workflow.status}</Badge>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="outline">Run</Button>
                  <Button size="sm" variant="outline">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeNav === "webhooks" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Webhook Configuration</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">12 active webhooks</p><Button className="mt-4" size="sm">+ Add Webhook</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "marketplace" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">App Marketplace</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Browse and install 500+ enterprise applications</p><Button className="mt-4" size="sm">Browse Apps</Button></CardContent></Card>
        </div>
      )}
    </div>
  );
}
