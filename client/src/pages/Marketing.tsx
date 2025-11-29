import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function Marketing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Marketing Automation</h1>
        <p className="text-muted-foreground text-sm">Create campaigns, nurture leads, and track engagement</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="email" data-testid="tab-email">Email</TabsTrigger>
          <TabsTrigger value="social" data-testid="tab-social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">18</p>
                  <p className="text-xs text-muted-foreground">Active Campaigns</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">28.5%</p>
                  <p className="text-xs text-muted-foreground">Avg Open Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">4.2%</p>
                  <p className="text-xs text-muted-foreground">Click Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">$245K</p>
                  <p className="text-xs text-muted-foreground">Pipeline Generated</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Marketing Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Email Campaigns", description: "Design, send, and track email campaigns" },
                  { name: "Lead Nurturing", description: "Automated drip campaigns and workflows" },
                  { name: "Social Media", description: "Schedule and manage social posts" },
                  { name: "Landing Pages", description: "Create conversion-optimized pages" },
                  { name: "Analytics", description: "Track engagement and ROI" },
                  { name: "Segmentation", description: "Target audiences with precision" },
                ].map((module) => (
                  <Button key={module.name} variant="outline" className="h-auto flex flex-col items-start justify-start p-4">
                    <span className="font-medium">{module.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{module.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Campaign management loading. Create multi-channel marketing campaigns.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Marketing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Email module loading. Design and send targeted email campaigns.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Social Media</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Social media module loading. Manage your social presence.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
