import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown } from "lucide-react";

export default function ProjectBudgetManagement() {
  const budgets = [
    { id: "pb1", project: "Project Alpha", category: "Labor", allocated: "$150,000", actual: "$135,000", variance: "-$15,000", status: "on-track" },
    { id: "pb2", project: "Project Beta", category: "Materials", allocated: "$80,000", actual: "$82,500", variance: "+$2,500", status: "over" },
    { id: "pb3", project: "Project Gamma", category: "Overhead", allocated: "$45,000", actual: "$40,000", variance: "-$5,000", status: "on-track" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Project Budget Management
        </h1>
        <p className="text-muted-foreground mt-2">Monitor project budgets and costs</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Allocated</p>
            <p className="text-2xl font-bold">$275K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold">$257.5K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold text-green-600">$17.5K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Budget Utilization</p>
            <p className="text-2xl font-bold">93.6%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Budget Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {budgets.map((budget) => (
            <div key={budget.id} className="p-3 border rounded-lg hover-elevate" data-testid={`budget-${budget.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{budget.project}</h3>
                <Badge variant={budget.status === "on-track" ? "default" : "destructive"}>{budget.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Category: {budget.category} • Allocated: {budget.allocated} • Actual: {budget.actual} • Variance: {budget.variance}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
