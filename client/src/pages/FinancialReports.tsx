import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

export default function FinancialReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground mt-1">Access financial statements and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Income Statement", period: "Q1 2025", date: "Jan 31" }
          { name: "Balance Sheet", period: "Q1 2025", date: "Jan 31" }
          { name: "Cash Flow Statement", period: "Q1 2025", date: "Jan 31" }
          { name: "Trial Balance", period: "Jan 2025", date: "Jan 31" }
          { name: "Profit & Loss", period: "YTD 2025", date: "Jan 31" }
          { name: "Budget Variance", period: "Q1 2025", date: "Jan 31" }
        ].map((report) => (
          <Card key={report.name} className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <h3 className="font-semibold">{report.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{report.period} • {report.date}</p>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" data-testid={`button-view-${report.name}`}>
                  <Eye className="h-4 w-4 mr-1" />View
                </Button>
                <Button size="sm" variant="outline" data-testid={`button-download-${report.name}`}>
                  <Download className="h-4 w-4 mr-1" />Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
