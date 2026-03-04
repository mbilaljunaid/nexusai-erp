import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Plus, Download } from "lucide-react";

export default function Reporting() {
  const [reports, setReports] = useState<any[]>([
    { id: "r1", name: "Monthly Sales Report", type: "sales", metrics: ["Revenue", "Conversion Rate", "Average Order Value"], schedule: "monthly" },
    { id: "r2", name: "Customer Churn Analysis", type: "churn", metrics: ["Churn Rate", "At-Risk Customers", "Retention Trend"], schedule: "weekly" },
    { id: "r3", name: "Operational Efficiency", type: "operations", metrics: ["Uptime", "Response Time", "Error Rate"], schedule: "daily" },
  ]);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Reporting
          </h1>
          <p className="text-muted-foreground mt-2">Create and manage comprehensive reports with customizable metrics</p>
        </div>
        <Button className="gap-2" data-testid="button-create-report">
          <Plus className="h-4 w-4" />
          Create Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.schedule).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Automated reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Today</div>
            <p className="text-xs text-muted-foreground mt-1">at 14:32 UTC</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate cursor-pointer" data-testid={`report-${report.id}`}>
              <div className="flex-1">
                <h3 className="font-medium">{report.name}</h3>
                <div className="flex gap-2 mt-2">
                  {report.metrics.map((metric: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{metric}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{report.schedule}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-download-${report.id}`}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
