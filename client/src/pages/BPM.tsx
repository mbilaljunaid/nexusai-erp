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

        <TabsContent value="processes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Process Library</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "P001", name: "Lead to Opportunity", status: "active", type: "Sales", steps: 8 },
                { id: "P002", name: "Invoice to Payment", status: "active", type: "Finance", steps: 12 },
                { id: "P003", name: "Hire to Onboard", status: "active", type: "HR", steps: 15 },
                { id: "P004", name: "Ticket to Resolution", status: "active", type: "Service", steps: 6 },
                { id: "P005", name: "Request to Approval", status: "draft", type: "Workflow", steps: 5 },
              ].map((process) => (
                <div key={process.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{process.name}</p>
                    <p className="text-xs text-muted-foreground">{process.id} • {process.steps} steps</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="secondary">{process.type}</Badge>
                    <Badge className={process.status === "active" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}>
                      {process.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Workflows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "WF001", name: "Auto-Score Leads", trigger: "Lead Created", actions: 3, executions: 2847 },
                { id: "WF002", name: "Escalate High-Value Deals", trigger: "Opportunity Amount > $50K", actions: 2, executions: 156 },
                { id: "WF003", name: "Send Interview Reminders", trigger: "Interview Scheduled", actions: 4, executions: 89 },
                { id: "WF004", name: "Auto-Create Invoice", trigger: "Deal Won", actions: 5, executions: 342 },
              ].map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{workflow.name}</p>
                    <p className="text-xs text-muted-foreground">Trigger: {workflow.trigger} • {workflow.actions} actions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">{workflow.executions}</p>
                    <p className="text-xs text-muted-foreground">executions</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">2.3h</p>
                  <p className="text-xs text-muted-foreground">Avg Process Time</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">92%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
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
              <CardTitle className="text-base">Process Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { process: "Lead to Opportunity", time: "2.1h", rate: "94%", trend: "+8%" },
                { process: "Invoice to Payment", time: "3.5h", rate: "89%", trend: "+12%" },
                { process: "Hire to Onboard", time: "5.2h", rate: "87%", trend: "+5%" },
              ].map((perf) => (
                <div key={perf.process} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm">{perf.process}</p>
                    <Badge variant="secondary" className="text-green-600">{perf.trend}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Time: {perf.time} • Success: {perf.rate}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
