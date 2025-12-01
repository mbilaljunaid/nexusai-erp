import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download } from "lucide-react";

export default function FinancialReportsDashboard() {
  const reports = [
    { id: "fr1", name: "Balance Sheet - Q3 2025", type: "Balance Sheet", period: "Q3", status: "approved", date: "Nov 30, 2025" }
    { id: "fr2", name: "P&L Statement - Nov 2025", type: "P&L", period: "Monthly", status: "draft", date: "Nov 30, 2025" }
    { id: "fr3", name: "Cash Flow - YTD 2025", type: "Cash Flow", period: "YTD", status: "approved", date: "Nov 25, 2025" }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Financial Reports
        </h1>
        <p className="text-muted-foreground mt-2">View and manage financial statements</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold">$25.5M</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Liabilities</p>
            <p className="text-2xl font-bold">$12.3M</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Equity</p>
            <p className="text-2xl font-bold text-green-600">$13.2M</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Net Income</p>
            <p className="text-2xl font-bold text-green-600">$2.1M</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Reports</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="p-3 border rounded-lg hover-elevate" data-testid={`report-${report.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{report.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={report.status === "approved" ? "default" : "secondary"}>{report.status}</Badge>
                  <Download className="h-4 w-4 cursor-pointer text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Type: {report.type} • Period: {report.period} • Date: {report.date}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
