import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function BPM() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Business Process Mapping</h1>
        <p className="text-muted-foreground text-sm">Design, optimize, and automate business workflows</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="processes" data-testid="tab-processes">Processes</TabsTrigger>
          <TabsTrigger value="workflows" data-testid="tab-workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">24</p>
                  <p className="text-xs text-muted-foreground">Mapped Processes</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">156</p>
                  <p className="text-xs text-muted-foreground">Active Workflows</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">42%</p>
                  <p className="text-xs text-muted-foreground">Automation Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">18h</p>
                  <p className="text-xs text-muted-foreground">Time Saved/Week</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">BPM Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Process Mapping", description: "Visualize and design business processes" },
                  { name: "Workflow Automation", description: "Automate repetitive tasks and approvals" },
                  { name: "Optimization", description: "Identify bottlenecks and improvements" },
                  { name: "Monitoring", description: "Track process performance and metrics" },
                  { name: "Compliance", description: "Enforce rules and compliance checks" },
                  { name: "Analytics", description: "Analyze process efficiency and ROI" },
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

        <TabsContent value="processes">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Process Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Process mapping module coming soon. Design and manage business processes visually.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workflow Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Workflow module coming soon. Create and manage automated workflows.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Process Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Analytics module coming soon. Measure and optimize process performance.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
