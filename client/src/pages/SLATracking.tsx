import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SLATracking() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SLA Tracking & Escalation</h1>
        <p className="text-muted-foreground mt-1">Monitor service level agreements</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Active SLAs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { tier: "Premium", response: "1 hour", resolution: "4 hours", current: "0.5h", status: "On Track" },
            { tier: "Standard", response: "2 hours", resolution: "8 hours", current: "1.2h", status: "On Track" },
            { tier: "Basic", response: "4 hours", resolution: "24 hours", current: "2h", status: "Warning" },
          ].map((sla, idx) => (
            <div key={idx} className="p-3 border rounded">
              <p className="font-semibold">{sla.tier}</p>
              <p className="text-sm text-muted-foreground">Response: {sla.response} • Resolution: {sla.resolution}</p>
              <p className="text-sm mt-1">Current: {sla.current}</p>
              <Badge className={sla.status === "On Track" ? "mt-2 bg-green-100 text-green-800" : "mt-2 bg-amber-100 text-amber-800"}>{sla.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
