import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { ModuleNavigationGrid } from "@/components/nav/ModuleNavigationGrid";
import { crmMenu } from "@/components/nav/CrmSidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuotaProgressWidget } from "@/components/crm/QuotaProgressWidget";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface CRMMetrics {
  totalLeads: number;
  pipelineValue: string;
  weightedPipelineValue: string;
  winRate: string;
  avgSalesCycle: string;
  leadsBySource: { name: string; value: number }[];
  revenueTrend: { month: string; value: number }[];
}

export default function CRM() {
  const [scope, setScope] = useState<"all" | "mine">("all");

  const { data: metrics, isLoading } = useQuery<CRMMetrics>({
    queryKey: ["/api/crm/metrics", scope],
    queryFn: async () => {
      const res = await fetch(`/api/crm/metrics?scope=${scope}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });

  return (
    <StandardPage
      title="CRM & Sales"
      description="Overview of your sales performance and pipeline activities."
      breadcrumbs={[]}
      actions={
        <Tabs value={scope} onValueChange={(v) => setScope(v as "all" | "mine")} className="w-[300px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Team Pipeline</TabsTrigger>
            <TabsTrigger value="mine">My Pipeline</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      <div className="mb-8">
        <ModuleNavigationGrid menu={crmMenu} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPIs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalLeads ?? "..."}</div>
            <p className="text-xs text-muted-foreground">
              {scope === 'mine' ? "Assigned to you" : "+12% from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted Forecast</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.weightedPipelineValue ?? "..."}</div>
            <p className="text-xs text-muted-foreground">Total Pipeline: {metrics?.pipelineValue ?? "..."}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.winRate ?? "..."}</div>
            <p className="text-xs text-muted-foreground">vs Industry avg 20%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sales Cycle</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgSalesCycle ?? "..."}</div>
            <p className="text-xs text-muted-foreground">-5 days improvement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Quota Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <QuotaProgressWidget userId="1" periodName="Q1-2026" />
          </CardContent>
        </Card>

        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics?.revenueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Leads by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.leadsBySource || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPage>
  );
}
