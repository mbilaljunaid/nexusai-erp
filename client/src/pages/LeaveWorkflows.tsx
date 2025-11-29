import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function LeaveWorkflows() {
  const { data: requests = [] } = useQuery({
    queryKey: ["/api/leave-requests"],
    retry: false,
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r: any) => r.status === "pending").length,
    approved: requests.filter((r: any) => r.status === "approved").length,
    days: requests.filter((r: any) => r.status === "approved").reduce((sum: number, r: any) => sum + r.days, 0),
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Leave Workflows</h1>
        <p className="text-muted-foreground text-sm">Request, approve, and track time off</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Requests</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div><p className="text-2xl font-semibold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{stats.days}</p>
              <p className="text-xs text-muted-foreground">Days Approved</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          {requests.filter((r: any) => r.status === "pending").map((req: any) => (
            <Card key={req.id}><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{req.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{req.type} • {req.days} days</p></div>
                <Button size="sm">Review</Button>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="approved">
          {requests.filter((r: any) => r.status === "approved").map((req: any) => (
            <Card key={req.id}><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{req.employeeName}</p></div>
                <Badge>APPROVED</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="balance"><p className="text-muted-foreground">Employee leave balance tracking</p></TabsContent>
      </Tabs>
    </div>
  );
}
