import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StandardTable, Column } from "@/components/ui/standardtable";

interface HRMetric {
  label: string;
  value: number;
  date: string;
  dimensions: Record<string, any>;
}

interface HRAnalyticsResponse {
  metrics: Record<string, HRMetric>;
  trends: any[];
}

export default function HRAnalyticsDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const formMetadata = getFormMetadata("hrAnalytics");

  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);

  // Main Dashboard Query
  const { data, isLoading } = useQuery<HRAnalyticsResponse>({
    queryKey: ["/api/hr/analytics/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/hr/analytics/dashboard");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    }
  });

  // Drill-down Query
  const { data: detailsData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["/api/hr/analytics/details", selectedKpi],
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
  const columns: ColumnDef<any>[] = [
    { accessorKey: "personName", header: "Name" },
    { accessorKey: "assignmentNumber", header: "Number" },
    { accessorKey: "startDate", header: "Start Date" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={[]} onFilter={setFiltered} />

      <div>
        <h1 className="text-3xl font-bold">HR Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time workforce insights (Tier-1)</p>
      </div>

      {/* KPI Cards (Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-zinc-800/50 transition-colors" onClick={() => setSelectedKpi("HR_HEADCOUNT")}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Headcount</p>
            <p className="text-3xl font-bold mt-1">{metrics["HR_HEADCOUNT"]?.value || 0}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-zinc-800/50 transition-colors" onClick={() => setSelectedKpi("HR_ATTRITION_VOL")}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Voluntary Turnover (30d)</p>
            <p className="text-3xl font-bold mt-1">{Number(metrics["HR_ATTRITION_VOL"]?.value || 0).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-zinc-800/50 transition-colors" onClick={() => setSelectedKpi("HR_GENDER_RATIO")}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gender Diversity (Female)</p>
            <p className="text-3xl font-bold mt-1">{Number(metrics["HR_GENDER_RATIO"]?.value || 0).toFixed(1)}%</p>
          </CardContent>
        </Card>
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
                <Tooltip />
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
                <Tooltip />
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
    </div>
  );
}
