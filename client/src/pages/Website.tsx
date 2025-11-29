import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Website() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Website Builder</h1>
          <p className="text-muted-foreground text-sm">Create and manage websites, landing pages, and digital presence</p>
        </div>
        <Button data-testid="button-create-website">
          <Plus className="h-4 w-4 mr-2" />
          Create Website
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="websites" data-testid="tab-websites">Websites</TabsTrigger>
          <TabsTrigger value="pages" data-testid="tab-pages">Pages</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">5</p>
                  <p className="text-xs text-muted-foreground">Active Websites</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">42</p>
                  <p className="text-xs text-muted-foreground">Total Pages</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">125K</p>
                  <p className="text-xs text-muted-foreground">Monthly Visitors</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">3.2%</p>
                  <p className="text-xs text-muted-foreground">Bounce Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Website Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Drag & Drop Builder", description: "No-code website designer" },
                  { name: "Templates", description: "Pre-designed website templates" },
                  { name: "Forms & CRM Integration", description: "Capture leads and integrate with CRM" },
                  { name: "E-Commerce", description: "Built-in shopping cart and payments" },
                  { name: "SEO Optimization", description: "SEO tools and analytics" },
                  { name: "Domain & Hosting", description: "Domain management and hosting" },
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

        <TabsContent value="websites">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Websites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Websites module coming soon. Create and manage multiple websites with drag-and-drop builder.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Page Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Page management module coming soon. Create landing pages, product pages, and custom pages.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Website Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Analytics module coming soon. Track visitors, conversions, and user behavior.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
