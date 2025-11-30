import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Wrench, TrendingUp } from "lucide-react";

export default function QualityManagement() {
  const [viewType, setViewType] = useState("checks");

  const { data: checks = [] } = useQuery<any[]>({ queryKey: ["/api/quality/checks"] });
  const { data: nonConformances = [] } = useQuery<any[]>({ queryKey: ["/api/quality/non-conformances"] });

  const passedChecks = checks.filter((c: any) => c.result === "pass").length;
  const openNCItems = nonConformances.filter((nc: any) => nc.status === "open").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quality Management</h1>
        <p className="text-muted-foreground mt-2">Track quality checks and non-conformances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Checks</p>
                <p className="text-2xl font-bold">{checks.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold">{checks.length > 0 ? Math.round((passedChecks / checks.length) * 100) : 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Open NCs</p>
                <p className="text-2xl font-bold">{openNCItems}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={viewType === "checks" ? "default" : "outline"}
          onClick={() => setViewType("checks")}
          data-testid="button-view-checks"
        >
          Quality Checks
        </Button>
        <Button
          variant={viewType === "nonconformances" ? "default" : "outline"}
          onClick={() => setViewType("nonconformances")}
          data-testid="button-view-nonconformances"
        >
          Non-Conformances
        </Button>
      </div>

      {viewType === "checks" && (
        <div className="space-y-3">
          {checks.map((check: any) => (
            <Card key={check.id} data-testid={`card-check-${check.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{check.checkNumber}</h4>
                    <p className="text-xs text-muted-foreground">Inspector: {check.inspector}</p>
                  </div>
                  <Badge variant={check.result === "pass" ? "default" : "destructive"} className="capitalize">
                    {check.result}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Type</span>
                    <p className="font-medium">{check.checkType}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Date</span>
                    <p className="font-medium">{new Date(check.checkDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Status</span>
                    <p className="font-medium capitalize">{check.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewType === "nonconformances" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nonConformances.map((nc: any) => (
            <Card key={nc.id} data-testid={`card-nonconformance-${nc.id}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    {nc.ncNumber}
                  </span>
                  <Badge
                    variant={nc.severity === "high" ? "destructive" : "default"}
                    className="capitalize"
                  >
                    {nc.severity}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Description</span>
                  <p className="text-sm">{nc.description}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant={nc.status === "open" ? "default" : "secondary"} className="capitalize mt-1">
                    {nc.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
