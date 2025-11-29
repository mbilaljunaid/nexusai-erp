import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ModuleNav } from "@/components/ModuleNav";
import { Users, Calendar, DollarSign, BarChart3 } from "lucide-react";

export default function HR() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">HR & Talent Management</h1>
        <p className="text-muted-foreground text-sm">Manage employees, recruitment, payroll, and performance</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="employees" data-testid="tab-employees">Employees</TabsTrigger>
          <TabsTrigger value="recruitment" data-testid="tab-recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="payroll" data-testid="tab-payroll">Payroll</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">245</p>
                  <p className="text-xs text-muted-foreground">Total Employees</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">12</p>
                  <p className="text-xs text-muted-foreground">Open Positions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">3.2%</p>
                  <p className="text-xs text-muted-foreground">Turnover (YTD)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">94%</p>
                  <p className="text-xs text-muted-foreground">Engagement Score</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">HR Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Employee Lifecycle", description: "Onboarding, transfers, and offboarding" },
                  { name: "Recruitment", description: "Job requisitions, candidate tracking, and hiring" },
                  { name: "Payroll", description: "Compensation, deductions, and tax management" },
                  { name: "Performance Management", description: "Goals, reviews, and development plans" },
                  { name: "Learning & Development", description: "Training paths and skill development" },
                  { name: "Succession Planning", description: "Identify and develop talent pipeline" },
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

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employee Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Employee management module coming soon. View, manage, and track all employee information.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruitment">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recruitment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Recruitment module coming soon. Manage job openings, candidates, and hiring process.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Payroll module coming soon. Process salaries, deductions, and tax compliance.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Performance module coming soon. Manage goals, reviews, and development plans.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ModuleNav
        title="HR Modules"
        items={[
          { title: "Employee Directory", icon: Users, href: "/employees" },
          { title: "Org Chart", icon: Users, href: "/org-chart" },
          { title: "Leave Requests", icon: Calendar, href: "/leave-request" },
          { title: "Payroll", icon: DollarSign, href: "/payroll" },
          { title: "Performance Reviews", icon: BarChart3, href: "/performance-reviews" },
          { title: "Talent Pool", icon: Users, href: "/talent-pool" },
        ]}
      />
    </div>
  );
}
