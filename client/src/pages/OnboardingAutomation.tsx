import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CheckCircle2, Clock, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function OnboardingAutomation() {
  const { data: onboardings = [] } = useQuery({
    queryKey: ["/api/onboarding/workflows"],
    retry: false,
  });

  const stats = {
    total: onboardings.length,
    inProgress: onboardings.filter((o: any) => o.status === "in_progress").length,
    completed: onboardings.filter((o: any) => o.status === "completed").length,
    docs: onboardings.reduce((sum: number, o: any) => sum + (o.documentsCount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Onboarding Automation</h1>
        <p className="text-muted-foreground text-sm">Document management and workflow automation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Employees</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div><p className="text-2xl font-semibold">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{stats.docs}</p>
              <p className="text-xs text-muted-foreground">Docs</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="workflows">
          {onboardings.map((ob: any) => (
            <Card key={ob.id}><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{ob.employeeName}</p>
                  <p className="text-sm text-muted-foreground">Start date: {ob.startDate}</p></div>
                <Badge variant={ob.status === "completed" ? "default" : "secondary"}>{ob.status}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="documents"><p className="text-muted-foreground">Onboarding document tracking</p></TabsContent>
        <TabsContent value="templates"><p className="text-muted-foreground">Reusable onboarding templates</p></TabsContent>
      </Tabs>
    </div>
  );
}
