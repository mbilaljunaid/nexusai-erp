import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getFormMetadata } from "@/lib/formMetadata";
import { Database, Zap, BarChart3, Briefcase } from "lucide-react";

export default function DataWarehouse() {
  const formMetadata = getFormMetadata("data-warehouse");
  const { data: lakes = [] } = useQuery({
    queryKey: ["/api/data-warehouse/lakes"]
  }) as { data: any[] };

  const { data: pipelines = [] } = useQuery({
    queryKey: ["/api/etl/pipelines"]
  }) as { data: any[] };

  const { data: dashboards = [] } = useQuery({
    queryKey: ["/api/bi/dashboards"]
  }) as { data: any[] };

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/field-service/jobs"]
  }) as { data: any[] };

  return (
    <div className="space-y-6 p-4">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="title-data-warehouse">
          <Database className="h-8 w-8" />
          Data Warehouse & Advanced BI
        </h1>
        <p className="text-muted-foreground mt-2">Cloud data warehouse, ETL pipelines, and advanced analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-metric-data-lakes">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between" data-testid="title-data-lakes">
              Data Lakes
              <Database className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-lakes-count">{lakes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">BigQuery, Snowflake, Redshift</p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-pipelines">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between" data-testid="title-pipelines">
              ETL Pipelines
              <Zap className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pipelines-count">{pipelines.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active data flows</p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-dashboards">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between" data-testid="title-dashboards">
              BI Dashboards
              <BarChart3 className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-dashboards-count">{dashboards.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Analytics views</p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-field-jobs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between" data-testid="title-field-jobs">
              Field Service
              <Briefcase className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-field-jobs-count">{jobs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active jobs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle data-testid="title-capabilities">Platform Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium" data-testid="text-cap-data-warehouse">Cloud Data Warehouse</span>
            <Badge data-testid="badge-cap-warehouse">BigQuery, Snowflake, Redshift</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium" data-testid="text-cap-etl">ETL Pipelines</span>
            <Badge variant="secondary" data-testid="badge-cap-etl">Scheduled data flows</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium" data-testid="text-cap-analytics">Advanced Analytics</span>
            <Badge variant="secondary" data-testid="badge-cap-analytics">50+ visualizations</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium" data-testid="text-cap-field-service">Field Service Management</span>
            <Badge variant="secondary" data-testid="badge-cap-field">Location tracking</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium" data-testid="text-cap-payroll">Global Payroll</span>
            <Badge variant="secondary" data-testid="badge-cap-payroll">150+ countries</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
