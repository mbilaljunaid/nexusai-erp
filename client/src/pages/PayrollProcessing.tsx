import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function PayrollProcessing() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Processing</h1>
          <p className="text-muted-foreground mt-1">Manage salary processing and payments</p>
        </div>
        <Button data-testid="button-process-payroll"><Plus className="h-4 w-4 mr-2" />Process Payroll</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Payroll</p>
            <p className="text-2xl font-bold mt-1">$245,600</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Processed</p>
            <p className="text-2xl font-bold mt-1">$180,400</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold mt-1">$65,200</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Payroll Runs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { month: "February 2025", status: "Processed", date: "Feb 28" },
            { month: "January 2025", status: "Processed", date: "Jan 31" },
            { month: "December 2024", status: "Processed", date: "Dec 31" },
          ].map((run, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 border rounded">
              <span className="font-medium text-sm">{run.month}</span>
              <div><Badge className="bg-green-100 text-green-800">{run.status}</Badge></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
