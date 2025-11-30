import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { Mail, Send, Archive, BarChart3, Users } from "lucide-react";

export default function EmailManagement() {
  const [activeNav, setActiveNav] = useState("campaigns");

  const navItems = [
    { id: "campaigns", label: "Campaigns", icon: Send, color: "text-blue-500" },
    { id: "templates", label: "Templates", icon: Mail, color: "text-purple-500" },
    { id: "subscribers", label: "Subscribers", icon: Users, color: "text-green-500" },
  ];

  const campaigns = [
    { id: "1", name: "Q1 2025 Launch", status: "active", sent: 5234, opens: 1249, clicks: 234 },
    { id: "2", name: "Holiday Promo", status: "completed", sent: 8934, opens: 2145, clicks: 512 },
    { id: "3", name: "Welcome Series", status: "active", sent: 3421, opens: 1834, clicks: 456 },
  ];

  const templates = [
    { name: "Welcome Email", category: "Onboarding", uses: 324 },
    { name: "Product Update", category: "Product", uses: 156 },
    { name: "Special Offer", category: "Promotion", uses: 89 },
    { name: "Monthly Newsletter", category: "Newsletter", uses: 245 },
  ];

  const calculateStats = (sent: number, opens: number, clicks: number) => ({
    openRate: ((opens / sent) * 100).toFixed(1),
    clickRate: ((clicks / opens) * 100).toFixed(1),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Mail className="h-8 w-8" />Email Management</h1>
          <p className="text-muted-foreground mt-2">Create, send, and track email campaigns</p>
        </div>
        <Button data-testid="button-new-campaign">
          <Send className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "campaigns" && (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const stats = calculateStats(campaign.sent, campaign.opens, campaign.clicks);
            return (
              <Card key={campaign.id} data-testid={`card-campaign-${campaign.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">Sent to {campaign.sent.toLocaleString()} subscribers</p>
                      </div>
                    </div>
                    <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div><p className="text-xs text-muted-foreground">Opens</p><p className="text-lg font-semibold">{stats.openRate}%</p></div>
                    <div><p className="text-xs text-muted-foreground">Clicks</p><p className="text-lg font-semibold">{stats.clickRate}%</p></div>
                    <div><p className="text-xs text-muted-foreground">Conversions</p><p className="text-lg font-semibold">{campaign.clicks}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" data-testid={`button-edit-campaign-${campaign.id}`}>Edit</Button>
                    {campaign.status === "active" && (<Button size="sm" variant="outline"><Archive className="h-4 w-4 mr-1" />Archive</Button>)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeNav === "templates" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.name} data-testid={`card-template-${template.name}`}>
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Category: {template.category}</p><p className="text-sm font-semibold mt-2">Used {template.uses} times</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeNav === "subscribers" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Subscriber Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Total subscribers: 45,234</p><p className="text-muted-foreground">Active: 42,123</p><p className="text-muted-foreground">Unsubscribed: 3,111</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
