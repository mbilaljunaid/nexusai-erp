import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ScheduledReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scheduled Reports</h1>
        <p className="text-muted-foreground mt-1">Automated report scheduling and delivery</p>
      </div>

      <div className="grid gap-4">
        {[
          { name: "Daily Sales Report", frequency: "Daily", time: "9:00 AM", recipients: "sales@company.com", status: "Active" }
          { name: "Weekly Analytics", frequency: "Weekly", time: "Monday 8:00 AM", recipients: "team@company.com", status: "Active" }
          { name: "Monthly Summary", frequency: "Monthly", time: "1st of month 10:00 AM", recipients: "exec@company.com", status: "Active" }
        ].map((report) => (
          <Card key={report.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{report.name}</h3>
                  <p className="text-sm text-muted-foreground">{report.frequency} at {report.time}</p>
                  <p className="text-xs text-muted-foreground mt-1">To: {report.recipients}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">{report.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
