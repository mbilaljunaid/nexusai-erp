import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getFormMetadata } from "@/lib/formMetadata";
import { Database, Zap, BarChart3, Briefcase, Server, Globe, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataWarehouse() {
  const formMetadata = getFormMetadata("data-warehouse");

  const { data: lakes = [], isLoading: lakesLoading } = useQuery({
    queryKey: ["/api/data-warehouse/lakes"],
  }) as { data: any[], isLoading: boolean };

  const { data: pipelines = [], isLoading: pipelinesLoading } = useQuery({
    queryKey: ["/api/etl/pipelines"],
  }) as { data: any[], isLoading: boolean };

  const { data: dashboards = [], isLoading: dashboardsLoading } = useQuery({
    queryKey: ["/api/bi/dashboards"],
  }) as { data: any[], isLoading: boolean };

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/field-service/jobs"],
  }) as { data: any[], isLoading: boolean };

  const isLoading = lakesLoading || pipelinesLoading || dashboardsLoading || jobsLoading;

  return (
    <StandardDashboard
      header={
        <div className="space-y-4">
          <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading" data-testid="title-data-warehouse">Data Warehouse & Advanced BI</h1>
            <p className="text-muted-foreground mt-1">Unified cloud data warehouse, ETL pipeline management, and advanced visualization layer</p>
          </div>
        </div>
      }
    >
      <DashboardWidget title="Data Lakes" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Database className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight" data-testid="text-lakes-count">{lakes.length}</div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">BigQuery, Snowflake</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="ETL Pipelines" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <Zap className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600" data-testid="text-pipelines-count">{pipelines.length}</div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Active data flows</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="BI Dashboards" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600" data-testid="text-dashboards-count">{dashboards.length}</div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Operational views</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Field Service" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <Briefcase className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600" data-testid="text-field-jobs-count">{jobs.length}</div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Dispatched jobs</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget colSpan={4} title="Platform Capabilities" icon={Activity}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
          {[
            { label: "Cloud Data Warehouse", val: "BigQuery, Snowflake, Redshift", icon: Server },
            { label: "ETL Pipelines", val: "Scheduled data flows", icon: Zap },
            { label: "Advanced Analytics", val: "50+ visualizations", icon: BarChart3 },
            { label: "Field Service Management", val: "Location tracking", icon: Briefcase },
            { label: "Global Payroll", val: "150+ countries", icon: Globe },
          ].map((cap, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <cap.icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{cap.label}</span>
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-tighter">{cap.val}</Badge>
            </div>
          ))}
        </div>
      </DashboardWidget>
    </StandardDashboard>
  );
}
