import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  Search,
  ExternalLink,
  Wrench,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert
} from "lucide-react";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { MetricCard } from "@/components/MetricCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RemediationSheet } from "@/components/compliance/RemediationSheet";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";

interface Violation {
  id: string;
  ruleName: string;
  entityType: string;
  entityId: string;
  status: string;
  severity: string;
  description: string;
  createdAt: string;
  remediationActions: string[];
}

export default function ComplianceExceptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  const { data: violations = [], isLoading } = useQuery<Violation[]>({
    queryKey: ["/api/hr/compliance/violations"],
    queryFn: () => fetch("/api/hr/compliance/violations").then(r => r.json()),
  });

  const pendingViolations = violations.filter(v => v.status === "open");
  const resolvedViolations = violations.filter(v => v.status === "resolved");

  const columns = [
    {
      id: "ruleName",
      header: "Rule / Exception Description",
      width: "300px",
      cell: (v: Violation) => (
        <div className="px-2 h-full flex flex-col justify-center">
          <span className="font-bold text-slate-900">{v.ruleName}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[400px]">{v.description}</span>
        </div>
      )
    },
    {
      id: "severity",
      header: "Severity",
      width: "150px",
      cell: (v: Violation) => (
        <div className="px-2 h-full flex items-center">
          <Badge variant={v.severity === 'critical' ? 'destructive' : 'secondary'}>
            {v.severity.toUpperCase()}
          </Badge>
        </div>
      )
    },
    {
      id: "entityId",
      header: "Person / Entity",
      width: "200px",
      cell: (v: Violation) => (
        <div className="px-2 h-full flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono">{v.entityType}</Badge>
          <span className="text-sm font-medium">{v.entityId}</span>
        </div>
      )
    },
    {
      id: "createdAt",
      header: "Detected On",
      width: "200px",
      cell: (v: Violation) => (
        <div className="px-2 h-full flex items-center text-sm text-muted-foreground font-mono">
          {format(new Date(v.createdAt), 'MMM d, yyyy HH:mm')}
        </div>
      )
    },
    {
      id: "status",
      header: "Status",
      width: "150px",
      cell: (v: Violation) => (
        <div className="px-2 h-full flex items-center">
          <Badge
            className={
              v.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-200' :
                'bg-orange-100 text-orange-700 border-orange-200'
            }
          >
            {v.status.toUpperCase()}
          </Badge>
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      width: "150px",
      cell: (v: Violation) => (
        <div className="px-2 h-full flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => setSelectedViolation(v)}
          >
            <Wrench className="h-4 w-4 mr-1" />
            Remediate
          </Button>
          <Link href={`/hr/persons/${v.entityId}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <StandardPage
      title="ComplianceExceptions"
      description=""
      className="space-y-6 container mx-auto"
    >
      <div>
        <Breadcrumb items={[{ label: "HR", path: "/hr" }, { label: "Compliance", path: "/compliance" }, { label: "Exceptions", path: "/compliance/exceptions" }]} />
        <h1 className="text-3xl font-bold tracking-tight mt-2 flex items-center gap-2">
          <AlertCircle className="h-8 w-8 text-orange-500" />
          Compliance Exceptions Workbench
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Monitor and resolve regulatory violations, policy exceptions, and risk-flagged transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Open Exceptions"
          value={pendingViolations.length}
          icon={ShieldAlert}
          iconColor="text-orange-500"
          loading={isLoading}
        />
        <MetricCard
          title="Avg. Resolution Time"
          value="2.4h"
          icon={Clock}
          iconColor="text-blue-500"
          loading={isLoading}
        />
        <MetricCard
          title="Successful Remediations"
          value={resolvedViolations.length}
          icon={CheckCircle2}
          iconColor="text-green-500"
          loading={isLoading}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-700">Exception Queue</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by rule or entity..."
                className="pl-9 h-9 w-72 bg-white border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filter
          </Button>
        </div>

        <div className="bg-card w-full rounded-md border-t h-[600px] mt-4">
          <InteractiveSpreadsheet
            data={violations}
            columns={columns}
            onChange={() => { }}
            virtualized={true}
            containerHeight="600px"
          />
        </div>
      </Card>

      <RemediationSheet
        violation={selectedViolation}
        onOpenChange={(open) => !open && setSelectedViolation(null)}
      />
    </StandardPage>
  );
}
