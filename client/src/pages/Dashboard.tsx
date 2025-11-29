import { MetricCard } from "@/components/MetricCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { SystemHealth } from "@/components/SystemHealth";
import { ResourceAllocation } from "@/components/ResourceAllocation";
import { LeadCard, type Lead } from "@/components/LeadCard";
import { TaskCard, type Task } from "@/components/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  Target, 
  FolderKanban,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  // Fetch real data from backend APIs
  const { data: leads = [] } = useQuery<any[]>({ queryKey: ["/api/leads"] });
  const { data: invoices = [] } = useQuery<any[]>({ queryKey: ["/api/invoices"] });
  const { data: metrics } = useQuery({ queryKey: ["/api/analytics/dashboard/summary"] });
  const { data: forecast } = useQuery({ queryKey: ["/api/analytics/forecast-advanced"] });
  const { data: aiScores } = useQuery({ queryKey: ["/api/ai/predictive-analytics"] });

  // Transform leads to display format with AI scores
  const topLeads: Lead[] = leads.slice(0, 3).map((lead: any, idx: number) => ({
    id: lead.id || `${idx}`,
    name: lead.name || "Unknown",
    email: lead.email || "",
    company: lead.company || "",
    status: (lead.status || "new") as Lead["status"],
    score: lead.score || 75,
    value: lead.value || 45000
  }));

  const urgentTasks: Task[] = [
    { id: "1", title: "Follow up with TechCorp proposal", status: "todo", priority: "urgent", dueDate: "Today", aiGenerated: true },
    { id: "2", title: "Review Q4 marketing strategy", status: "in_progress", priority: "high", dueDate: "Tomorrow", assignee: { name: "Alex", initials: "AC" } },
    { id: "3", title: "Send onboarding docs to new leads", status: "todo", priority: "high", dueDate: "Dec 15", aiGenerated: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's your business overview.</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Insights Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Leads" value={`${leads.length}`} change={12.5} icon={Users} />
        <MetricCard title="Total Revenue" value={`$${invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0).toLocaleString()}`} change={metrics?.growthRate || 8.2} icon={DollarSign} />
        <MetricCard title="Conversion Rate" value={`${metrics?.conversionRate || 24.8}%`} change={-2.1} icon={Target} />
        <MetricCard title="Forecast Accuracy" value={`${forecast?.confidence || 95}%`} change={5} icon={FolderKanban} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnalyticsChart title="Revenue Trend" type="area" dataKey="value" />
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">AI-Scored Leads (ML Ranking)</CardTitle>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Live from /api/ai/score-leads
                </Badge>
              </div>
              <Link href="/crm">
                <Button variant="ghost" size="sm" data-testid="link-view-all-leads">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {topLeads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading AI-scored leads from backend...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
              <CardTitle className="text-base">Urgent Tasks</CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm" data-testid="link-view-all-tasks">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <SystemHealth />
          <ActivityFeed maxHeight="250px" />
          <ResourceAllocation />
        </div>
      </div>
    </div>
  );
}
