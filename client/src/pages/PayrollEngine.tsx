import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Calculator, TrendingUp, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function PayrollEngine() {
  const { data: payrolls = [] } = useQuery({
    queryKey: ["/api/payroll/runs"],
    retry: false,
  });

  const stats = {
    total: payrolls.length,
    processed: payrolls.filter((p: any) => p.status === "processed").length,
    pending: payrolls.filter((p: any) => p.status === "pending").length,
    totalAmount: payrolls.reduce((sum: number, p: any) => sum + parseFloat(p.totalAmount || "0"), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Payroll Engine</h1>
          <p className="text-muted-foreground text-sm">Tax calculations and compliance</p>
        </div>
        <Button><Calculator className="w-4 h-4 mr-2" />Run Payroll</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.processed}</p>
                <p className="text-xs text-muted-foreground">Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold font-mono">${(stats.totalAmount / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
          <TabsTrigger value="taxes">Tax Config</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
        </TabsList>
        <TabsContent value="runs" className="space-y-3">
          {payrolls.map((run: any) => (
            <Card key={run.id}><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{run.name}</p>
                  <p className="text-sm text-muted-foreground">{run.period}</p></div>
                <div><Badge>{run.status.toUpperCase()}</Badge></div>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="taxes"><p className="text-muted-foreground">Tax configuration settings</p></TabsContent>
        <TabsContent value="deductions"><p className="text-muted-foreground">Employee deductions and withholdings</p></TabsContent>
      </Tabs>
    </div>
  );
}
