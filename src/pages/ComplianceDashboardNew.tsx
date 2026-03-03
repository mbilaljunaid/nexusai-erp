import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { ComplianceAnalytics } from "@/components/compliance/ComplianceAnalytics";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function ComplianceDashboardNew() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/hr/compliance/analytics"],
    queryFn: () => fetch("/api/hr/compliance/analytics").then(r => r.json()),
  });

  const metrics = analyticsData?.metrics || { totalRules: 0, openViolations: 0, criticalIssues: 0 };

  return (
    <StandardPage
      title="ComplianceDashboardNew"
      description=""
      className="space-y-6 container mx-auto"
    >
      <div>
        <Breadcrumb items={[{ label: "HR", path: "/hr" }, { label: "Compliance & Risk", path: "/compliance/dashboard" }]} />
        <h1 className="text-3xl font-bold tracking-tight mt-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Compliance & Risk Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Overview of global regulatory adherence, risk scoring, and active violations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Active Governance Rules"
          value={metrics.totalRules}
          icon={CheckCircle2}
          iconColor="text-green-500"
          loading={isLoading}
        />
        <MetricCard
          title="Open Violations"
          value={metrics.openViolations}
          icon={AlertTriangle}
          iconColor="text-orange-500"
          loading={isLoading}
        />
        <MetricCard
          title="Critical Risk Issues"
          value={metrics.criticalIssues}
          icon={Shield}
          iconColor="text-red-500"
          loading={isLoading}
        />
      </div>

      {analyticsData && (
        <ComplianceAnalytics data={analyticsData} />
      )}
    </StandardPage>
  );
}
