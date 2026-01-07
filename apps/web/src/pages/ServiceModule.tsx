import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function ServiceModule() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Module</h1>
          <p className="text-muted-foreground">Manage contracts, incidents, and SLA tracking</p>
        </div>
        <Button data-testid="button-create-incident">
          <Plus className="w-4 h-4 mr-2" />
          New Incident
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Incidents</p>
                <p className="text-2xl font-bold mt-1">5</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold mt-1">4.2h</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">SLA Compliance</p>
              <p className="text-2xl font-bold mt-1 text-green-600">98%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Critical Incidents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { num: "INC-001", title: "System Outage", severity: "critical" },
              { num: "INC-002", title: "Database Connection", severity: "high" },
            ].map((incident) => (
              <div key={incident.num} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{incident.title}</p>
                    <p className="text-xs text-muted-foreground">{incident.num}</p>
                  </div>
                  <Badge variant={incident.severity === "critical" ? "destructive" : "default"}>
                    {incident.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Service Contracts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { num: "SC-001", customer: "Tech Corp", amount: "$50K", uptime: "99.9%" },
              { num: "SC-002", customer: "Finance Inc", amount: "$75K", uptime: "99.95%" },
            ].map((contract) => (
              <div key={contract.num} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{contract.customer}</p>
                    <p className="text-xs text-muted-foreground">{contract.num}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-mono">{contract.amount}/yr</p>
                    <p className="text-muted-foreground">{contract.uptime}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
