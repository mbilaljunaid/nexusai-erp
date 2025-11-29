import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Compliance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Compliance & Audit</h1>
        <p className="text-muted-foreground text-sm">Monitor regulatory compliance and audit activities</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="standards" data-testid="tab-standards">Standards</TabsTrigger>
          <TabsTrigger value="audits" data-testid="tab-audits">Audits</TabsTrigger>
          <TabsTrigger value="risks" data-testid="tab-risks">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">4</p>
                  <p className="text-xs text-muted-foreground">Certifications</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">98%</p>
                  <p className="text-xs text-muted-foreground">Compliance Score</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">2</p>
                  <p className="text-xs text-muted-foreground">Open Issues</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">1</p>
                  <p className="text-xs text-muted-foreground">Medium Risk</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "SOC 2 Type II", status: "compliant" },
                { name: "GDPR", status: "compliant" },
                { name: "HIPAA", status: "compliant" },
                { name: "ISO 27001", status: "in_progress" },
              ].map((standard) => (
                <div key={standard.name} className="flex items-center justify-between p-3 rounded-md border">
                  <span className="font-medium text-sm">{standard.name}</span>
                  <Badge variant="secondary" className={standard.status === "compliant" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}>
                    {standard.status === "compliant" ? "Compliant" : "In Progress"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standards">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Standards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Compliance standards module coming soon. Manage and track regulatory compliance.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Audit module coming soon. Manage internal and external audits.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Risk assessment module coming soon. Identify and mitigate compliance risks.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
