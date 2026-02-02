import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Archive, DollarSign } from "lucide-react";
import { GLMetrics } from "./gl/components/GLMetrics";
import { StandardPage } from "@/components/layout/StandardPage";
import { ModuleNavigationGrid } from "@/components/nav/ModuleNavigationGrid";
import { financeMenu } from "@/components/nav/FinanceSidebar";

export default function Finance() {
  const [, setLocation] = useLocation();

  return (
    <StandardPage
      title="Finance & Accounting"
      breadcrumbs={[]} // Root level for module
      className="gap-6"
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
          <p className="text-muted-foreground">Real-time metrics and period close status.</p>
        </div>

        {/* Navigation Grid (Odoo Style) */}
        <ModuleNavigationGrid menu={financeMenu} />

        <GLMetrics />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm bg-indigo-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Shield className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Compliance & Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <p className="text-sm text-indigo-100/70">NexusAI GL is running with Oracle-grade Segment Value Security (SVS) and enhanced audit trails enabled.</p>
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-none text-white text-xs" onClick={() => setLocation("/gl/audit")}>
                View Audit Trail
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Archive className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Period Close Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <p className="text-sm text-slate-400">Successfully close fiscal periods with automated diagnostics and exception reporting.</p>
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-none text-white text-xs" onClick={() => setLocation("/gl/period-close")}>
                Go to Close Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPage>
  );
}
