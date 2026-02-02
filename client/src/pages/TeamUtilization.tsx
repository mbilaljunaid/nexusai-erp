import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TeamUtilization() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Utilization</h1>
        <p className="text-muted-foreground mt-1">Support team capacity and workload</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Team Members</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { agent: "John Support", tickets: 12, utilization: "95%" },
            { agent: "Sarah Help", tickets: 8, utilization: "64%" },
            { agent: "Mike Assistant", tickets: 10, utilization: "80%" },
            { agent: "Lisa Support", tickets: 6, utilization: "48%" },
          ].map((member, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium text-sm">{member.agent}</p>
                <p className="text-xs text-muted-foreground">{member.tickets} tickets</p>
              </div>
              <Badge>{member.utilization}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
