import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { MetricCard } from "@/components/MetricCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Sparkles,
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30d");

  // todo: remove mock functionality
  const forecastData = [
    { name: "Dec", actual: 128000, predicted: 135000 },
    { name: "Jan", actual: null, predicted: 142000 },
    { name: "Feb", actual: null, predicted: 155000 },
    { name: "Mar", actual: null, predicted: 168000 },
  ];

  const conversionData = [
    { stage: "Leads", count: 2847, rate: 100 },
    { stage: "Contacted", count: 1842, rate: 64.7 },
    { stage: "Qualified", count: 923, rate: 32.4 },
    { stage: "Proposal", count: 461, rate: 16.2 },
    { stage: "Won", count: 184, rate: 6.5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground text-sm">AI-powered insights and predictive analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36" data-testid="select-date-range">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export-report">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Revenue" value="$128,450" change={8.2} icon={DollarSign} />
        <MetricCard title="New Leads" value="847" change={12.5} icon={Users} />
        <MetricCard title="Conversion Rate" value="6.5%" change={-0.8} icon={Target} />
        <MetricCard title="Avg Deal Size" value="$27,500" change={15.3} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart title="Revenue Trend" type="area" dataKey="value" />
        <AnalyticsChart title="Leads by Month" type="bar" dataKey="leads" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Revenue Forecast</CardTitle>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Predicted
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {forecastData.map((item) => (
                  <div key={item.name} className="text-center p-4 rounded-md bg-muted/50">
                    <p className="text-sm text-muted-foreground">{item.name}</p>
                    {item.actual ? (
                      <p className="text-xl font-semibold font-mono mt-1">${(item.actual / 1000).toFixed(0)}K</p>
                    ) : (
                      <div>
                        <p className="text-xl font-semibold font-mono mt-1 text-primary">${(item.predicted / 1000).toFixed(0)}K</p>
                        <Badge variant="secondary" className="text-xs mt-1">Predicted</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-md bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <p className="text-sm font-medium">Q1 2025 projected to grow 31%</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on current pipeline value and historical conversion rates, revenue is expected to reach $168K by March 2025.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversionData.map((stage, index) => (
              <div key={stage.stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{stage.stage}</span>
                  <span className="font-mono">{stage.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${stage.rate}%` }}
                  />
                </div>
                {index < conversionData.length - 1 && (
                  <p className="text-xs text-muted-foreground text-right">
                    {((conversionData[index + 1].count / stage.count) * 100).toFixed(1)}% conversion
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Analytics Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-md bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Positive Trend</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Lead quality has improved by 18% this month. High-scoring leads (80+) now represent 34% of total leads, up from 28%.
              </p>
            </div>
            <div className="p-4 rounded-md bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Opportunity</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Leads from the Technology sector have 2x higher conversion. Consider allocating more marketing budget to this segment.
              </p>
            </div>
            <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Attention Needed</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Proposal-to-Won conversion dropped 12% this month. Review recent lost deals to identify common objections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">Generated Reports</CardTitle>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate New
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: "Q4 2024 Sales Performance", date: "Nov 28, 2024", type: "Sales" },
              { name: "Lead Source Analysis", date: "Nov 25, 2024", type: "Marketing" },
              { name: "Team Productivity Report", date: "Nov 20, 2024", type: "Operations" },
            ].map((report) => (
              <div 
                key={report.name}
                className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover-elevate"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{report.type}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
