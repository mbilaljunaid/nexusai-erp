import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { Plug, Link2, Database, Code } from "lucide-react";

export default function Integrations() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: Plug, color: "text-blue-500" }
    { id: "connectors", label: "Connectors", icon: Link2, color: "text-purple-500" }
    { id: "flows", label: "Data Flows", icon: Database, color: "text-green-500" }
    { id: "api", label: "API & Webhooks", icon: Code, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><Plug className="h-8 w-8" />Integration Hub</h1>
        <p className="text-muted-foreground text-sm">Connect to external systems and automate data flows</p>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">18</p><p className="text-xs text-muted-foreground">Active Connectors</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">42</p><p className="text-xs text-muted-foreground">Data Flows</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">99.9%</p><p className="text-xs text-muted-foreground">Uptime</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">2.1M</p><p className="text-xs text-muted-foreground">Records/Month</p></div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Available Integrations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Salesforce", category: "CRM" }
                { name: "NetSuite", category: "ERP" }
                { name: "SAP", category: "ERP" }
                { name: "Slack", category: "Communication" }
                { name: "Microsoft Teams", category: "Communication" }
                { name: "Quickbooks", category: "Accounting" }
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-3 rounded-md border hover-elevate">
                  <div>
                    <p className="font-medium text-sm">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.category}</p>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "connectors" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Active Connectors</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "C001", name: "Salesforce CRM", category: "CRM", status: "connected", lastSync: "2 min ago" }
              { id: "C002", name: "NetSuite ERP", category: "ERP", status: "connected", lastSync: "5 min ago" }
              { id: "C003", name: "Slack", category: "Communication", status: "connected", lastSync: "1 min ago" }
              { id: "C004", name: "Stripe Payments", category: "Payment", status: "connected", lastSync: "3 min ago" }
            ].map((connector) => (
              <div key={connector.id} className="border rounded-lg p-3 hover-elevate cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{connector.name}</p>
                    <p className="text-xs text-muted-foreground">{connector.category} • {connector.lastSync}</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600">{connector.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeNav === "flows" && (
        <Card><CardHeader><CardTitle className="text-base">Data Flows</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">42 active data flows configured</p><Button size="sm" className="mt-4">+ New Flow</Button></CardContent></Card>
      )}

      {activeNav === "api" && (
        <Card><CardHeader><CardTitle className="text-base">API & Webhooks</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">REST API endpoints and webhook configurations</p><Button size="sm" className="mt-4">View API Docs</Button></CardContent></Card>
      )}
    </div>
  );
}
