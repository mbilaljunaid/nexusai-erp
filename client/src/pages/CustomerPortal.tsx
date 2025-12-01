import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CustomerPortal() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Portal</h1>
        <p className="text-muted-foreground mt-1">Customer self-service access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition cursor-pointer">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">4</p>
            <p className="text-sm text-muted-foreground mt-1">Open Tickets</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-muted-foreground mt-1">Total Tickets</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">89</p>
            <p className="text-sm text-muted-foreground mt-1">Articles Viewed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { action: "Submitted ticket TK-045", time: "2 hours ago" }
            { action: "Viewed article: API guide", time: "1 day ago" }
            { action: "Ticket TK-041 resolved", time: "2 days ago" }
          ].map((activity, idx) => (
            <div key={idx} className="flex justify-between p-2 border rounded text-sm">
              <span>{activity.action}</span>
              <span className="text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
