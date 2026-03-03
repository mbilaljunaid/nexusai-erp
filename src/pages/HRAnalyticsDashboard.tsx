import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StandardTable, Column } from "@/components/ui/StandardTable";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";

interface HRMetric {
  label: string;
  description?: string;
  value: number;
  date: string;
  dimensions: Record<string, any>;
}

interface HRAnalyticsResponse {
  metrics: Record<string, HRMetric>;
  trends: any[];
  benchmark?: {
    p50Salary: string;
    p90Salary: string;
    avgTurnoverRate: string;
  } | null;
}

export default function HRAnalyticsDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const formMetadata = getFormMetadata("hrAnalytics");

  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string>("ALL");

  // Fetch Departments
  const { data: departments } = useQuery({
    queryKey: ["/api/hr/analytics/departments"],
    queryFn: async () => {
      const res = await fetch("/api/hr/analytics/departments");
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Main Dashboard Query
  const { data, isLoading } = useQuery<HRAnalyticsResponse>({
    queryKey: ["/api/hr/analytics/dashboard", departmentId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (departmentId !== "ALL") queryParams.append("departmentId", departmentId);

      const res = await fetch(`/api/hr/analytics/dashboard?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    }
  });

  // Drill-down Query
  const { data: detailsData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["/api/hr/analytics/details", selectedKpi], // Drill down query needs to know filters too? Logic in drill down route?
    queryFn: async () => {
      if (!selectedKpi) return [];
      const res = await fetch(`/api/hr/analytics/details/${selectedKpi}`);
      if (!res.ok) throw new Error("Failed to fetch details");
      return res.json();
    },
    enabled: !!selectedKpi
  });

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const metrics = data?.metrics || {};

  // Transform for charts
  const turnoverData = [
    { month: "Current", turnover: metrics["HR_ATTRITION_VOL"]?.value || 0 }
  ];

  const genderData = metrics["HR_GENDER_RATIO"]?.dimensions ?
    Object.entries(metrics["HR_GENDER_RATIO"].dimensions).map(([name, value]) => ({ name, value }))
    : []; // No data fallback instead of mock

  // Column Definitions for Drill Down
  const columns: Column<any>[] = [
    { accessorKey: "personName", header: "Name" },
    { accessorKey: "assignmentNumber", header: "Number" },
    { accessorKey: "startDate", header: "Start Date" },
  ];

  return (
    <StandardPage
      title="HR Analytics Dashboard"
      description="Real-time workforce insights (Tier-1)"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
        <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={Object.values(metrics)} onFilter={setFiltered} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time workforce insights (Tier-1)</p>
        </div>
        <div className="w-[200px]">
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments?.map((dept: any) => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards (Clickable) */}
      {/* KPI Cards (Dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["HR_HEADCOUNT", "HR_ATTRITION_VOL", "HR_GENDER_RATIO"].map((code) => {
          const metric = metrics[code];
          const isClickable = true; // Could be prop based on metric metadata

          return (
            <Card
              key={code}
              className={`transition-colors ${isClickable ? 'cursor-pointer hover:bg-zinc-800/50' : ''}`}
              onClick={() => isClickable && setSelectedKpi(code)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{metric?.label || "Loading..."}</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground/50 hover:text-primary" /></TooltipTrigger>
                      <TooltipContent>
                        {metric?.description || "Key Performance Indicator for Workforce."}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {isLoading ? <Skeleton className="h-9 w-24" /> : (
                  <div>
                    <p className="text-3xl font-bold">
                      {metric?.value ? (code === "HR_HEADCOUNT" ? metric.value : `${Number(metric.value).toFixed(1)}%`) : "0"}
                    </p>

                    {/* Benchmarking Badge (Specific to Attrition for now) */}
                    {code === "HR_ATTRITION_VOL" && data?.benchmark?.avgTurnoverRate && (
                      <div className="mt-2 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded inline-block">
                        Better than Market ({Number(data.benchmark.avgTurnoverRate).toFixed(1)}%)
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Turnover Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="turnover" fill="#ef4444" name="Voluntary %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Demographics</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {genderData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Drill Down Sheet */}
      <Sheet open={!!selectedKpi} onOpenChange={(o) => !o && setSelectedKpi(null)}>
        <SheetContent className="min-w-[50vw]">
          <SheetHeader>
            <SheetTitle>Metric Details: {metrics[selectedKpi || ""]?.label}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {isLoadingDetails ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <StandardTable
                data={detailsData || []}
                columns={columns}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </StandardPage>
  );
}
