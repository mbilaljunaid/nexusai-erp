import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";

export default function Email() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Email Management</h1>
          <p className="text-muted-foreground text-sm">Unified email, team collaboration, and marketing campaigns</p>
        </div>
        <Button data-testid="button-compose-email">
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox" data-testid="tab-inbox">Inbox</TabsTrigger>
          <TabsTrigger value="accounts" data-testid="tab-accounts">Email Accounts</TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
          <TabsTrigger value="automation" data-testid="tab-automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">842</p>
                  <p className="text-xs text-muted-foreground">Unread Emails</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">15</p>
                  <p className="text-xs text-muted-foreground">Team Members</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">28</p>
                  <p className="text-xs text-muted-foreground">Email Accounts</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">2.4h</p>
                  <p className="text-xs text-muted-foreground">Avg Response Time</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Management Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Unified Inbox", description: "Manage all emails in one place" },
                  { name: "Team Collaboration", description: "Assign, comment, and share emails" },
                  { name: "CRM Integration", description: "Link emails to contacts and deals" },
                  { name: "Email Tracking", description: "Track opens, clicks, and replies" },
                  { name: "Templates", description: "Save and reuse email templates" },
                  { name: "Automation", description: "Auto-responders and workflows" },
                ].map((capability) => (
                  <Button key={capability.name} variant="outline" className="h-auto flex flex-col items-start justify-start p-4">
                    <span className="font-medium">{capability.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{capability.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Email accounts module coming soon. Connect and manage multiple email addresses and accounts.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Email campaigns module coming soon. Create and send bulk email campaigns with tracking.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Templates module coming soon. Create and manage reusable email templates.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Automation module coming soon. Set up automatic workflows and follow-ups.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
