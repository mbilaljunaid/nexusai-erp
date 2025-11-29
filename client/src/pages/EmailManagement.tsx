import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, Archive, Trash2, Plus } from "lucide-react";

export default function EmailManagement() {
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
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground mt-2">Create, send, and track email campaigns</p>
        </div>
        <Button data-testid="button-new-campaign">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4 mt-6">
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
                    <div>
                      <p className="text-xs text-muted-foreground">Opens</p>
                      <p className="text-lg font-semibold">{stats.openRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Clicks</p>
                      <p className="text-lg font-semibold">{stats.clickRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Conversions</p>
                      <p className="text-lg font-semibold">{campaign.clicks}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" data-testid={`button-edit-campaign-${campaign.id}`}>
                      Edit
                    </Button>
                    {campaign.status === "active" && (
                      <Button size="sm" variant="outline">
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-6">
          {templates.map((template, idx) => (
            <Card key={idx} data-testid={`template-${template.name.replace(/\s+/g, "-").toLowerCase()}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.category} • Used {template.uses} times</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="subscribers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Lists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["All Subscribers", "Active Users", "Inactive Users", "High-Value Customers"].map((list, idx) => (
                  <div key={idx} className="p-3 border rounded-lg flex justify-between items-center" data-testid={`list-${list.replace(/\s+/g, "-").toLowerCase()}`}>
                    <span className="font-medium">{list}</span>
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
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
