import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BudgetEntryForm } from "@/components/forms/BudgetEntryForm";
import { ForecastSubmissionForm } from "@/components/forms/ForecastSubmissionForm";
import { ScenarioBuilderForm } from "@/components/forms/ScenarioBuilderForm";
import { IconNavigation } from "@/components/IconNavigation";
import { TrendingUp, DollarSign, Target, AlertCircle, BarChart3 } from "lucide-react";

export default function EPMModule() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "budget", label: "Budget", icon: DollarSign, color: "text-green-500" },
    { id: "forecast", label: "Forecast", icon: TrendingUp, color: "text-purple-500" },
    { id: "scenario", label: "Scenario", icon: Target, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><BarChart3 className="h-8 w-8" />EPM - Enterprise Performance Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Budget planning, forecasting, scenario modeling, consolidation, and variance analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-xs text-muted-foreground">Budget vs Actual</p><p className="text-2xl font-semibold">98.5%</p><Badge variant="outline" className="text-xs mt-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300">On Track</Badge></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-xs text-muted-foreground">Planning Complete</p><p className="text-2xl font-semibold">72%</p><p className="text-xs text-muted-foreground mt-2">8 of 11 depts</p></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-xs text-muted-foreground">Forecast Accuracy</p><p className="text-2xl font-semibold">94.2%</p><Badge variant="outline" className="text-xs mt-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300">MAPE</Badge></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-xs text-muted-foreground">Consolidation</p><p className="text-2xl font-semibold">6/6</p><p className="text-xs text-muted-foreground mt-2">entities ready</p></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-xs text-muted-foreground">Open Variances</p><p className="text-2xl font-semibold">12</p><Badge variant="outline" className="text-xs mt-2 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300">Review</Badge></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-xs text-muted-foreground">Plan Cycle Time</p><p className="text-2xl font-semibold">14 days</p><p className="text-xs text-muted-foreground mt-2">Target: 21 days</p></div></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">EPM Capabilities</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Budget planning, forecasting, scenario modeling, consolidation, and variance analysis</p></CardContent></Card>
        </div>
      )}

      {activeNav === "budget" && (
        <div className="space-y-4">
          <BudgetEntryForm />
        </div>
      )}

      {activeNav === "forecast" && (
        <div className="space-y-4">
          <ForecastSubmissionForm />
        </div>
      )}

      {activeNav === "scenario" && (
        <div className="space-y-4">
          <ScenarioBuilderForm />
        </div>
      )}
    </div>
  );
}
