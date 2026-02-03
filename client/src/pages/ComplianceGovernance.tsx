import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "wouter";
import {
  ShieldCheck,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Gavel,
  Trash2,
  ExternalLink,
  Wrench,
  Filter
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/ui/standardtable";
import { MetricCard } from "@/components/MetricCard";
import { ComplianceAnalytics } from "@/components/compliance/ComplianceAnalytics";
import { RemediationSheet } from "@/components/compliance/RemediationSheet";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/Breadcrumb";

interface ComplianceRule {
  id: string;
  ruleName: string;
  jurisdiction: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive';
  createdAt?: string;
}

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

export default function ComplianceGovernance() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [newRule, setNewRule] = useState({ ruleName: "", jurisdiction: "", riskLevel: "medium" as const });
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  const { data: rules = [], isLoading } = useQuery<ComplianceRule[]>({
    queryKey: ["/api/hr/compliance-rules"],
    queryFn: () => fetch("/api/hr/compliance-rules").then(r => r.json()),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/hr/compliance/analytics"],
    queryFn: () => fetch("/api/hr/compliance/analytics").then(r => r.json()),
  });

  const { data: violations = [] } = useQuery<Violation[]>({
    queryKey: ["/api/hr/compliance/violations"],
    queryFn: () => fetch("/api/hr/compliance/violations").then(r => r.json()),
  });

  const metrics = analyticsData?.metrics || { totalRules: 0, openViolations: 0, criticalIssues: 0 };

  const createMutation = useMutation({
    mutationFn: (data: typeof newRule) => fetch("/api/hr/compliance-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/compliance-rules"] });
      setNewRule({ ruleName: "", jurisdiction: "", riskLevel: "medium" });
      toast({ title: "Compliance rule created", description: "The new governance policy is now active." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hr/compliance-rules/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/compliance-rules"] });
      toast({ title: "Rule deleted", description: "The policy has been removed from the registry." });
    },
  });

  const columns: Column<ComplianceRule>[] = [
    {
      header: "Rule Name",
      accessorKey: "ruleName",
      cell: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.ruleName}</span>
          <span className="text-xs text-muted-foreground font-mono">{r.id.substring(0, 8)}</span>
        </div>
      )
    },
    {
      header: "Jurisdiction",
      accessorKey: "jurisdiction",
      cell: (r) => <Badge variant="outline">{r.jurisdiction}</Badge>
    },
    {
      header: "Risk Level",
      accessorKey: "riskLevel",
      cell: (r) => (
        <Badge variant={r.riskLevel === "high" || r.riskLevel === "critical" ? "destructive" : r.riskLevel === "medium" ? "secondary" : "default"}>
          {r.riskLevel.toUpperCase()}
        </Badge>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (r) => (
        <Badge variant={r.status === "active" ? "default" : "secondary"} className={r.status === "active" ? "bg-green-500/10 text-green-600 border-none" : ""}>
          {r.status.toUpperCase()}
        </Badge>
      )
    },
    {
      header: "Actions",
      id: "actions",
      cell: (r) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(r.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const violationColumns: Column<Violation>[] = [
    {
      header: "Rule / Description",
      accessorKey: "ruleName",
      cell: (v) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{v.ruleName}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[300px]">{v.description}</span>
        </div>
      )
    },
    {
      header: "Severity",
      accessorKey: "severity",
      cell: (v) => (
        <Badge variant={v.severity === 'critical' ? 'destructive' : 'secondary'}>
          {v.severity.toUpperCase()}
        </Badge>
      )
    },
    {
      header: "Entity",
      accessorKey: "entityId",
      cell: (v) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{v.entityType}</span>
          <span className="text-sm font-medium">{v.entityId}</span>
        </div>
      )
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      cell: (v) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(v.createdAt), 'MMM d, yyyy')}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (v) => (
        <Badge
          className={
            v.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100' :
              v.status === 'dismissed' ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100' :
                'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100'
          }
        >
          {v.status.toUpperCase()}
        </Badge>
      )
    },
    {
      header: "Actions",
      id: "actions",
      cell: (v) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => setSelectedViolation(v)}
          >
            <Wrench className="h-4 w-4 mr-1" />
            Remediate
          </Button>
          <Link href={`/hr/persons/${v.entityId}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-slate-900">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 container mx-auto" data-testid="compliance-governance">
      <div className="flex justify-between items-start">
        <div>
          <Breadcrumb items={[{ label: "HR", path: "/hr" }, { label: "Compliance & Governance", path: "/compliance/governance" }]} />
          <h1 className="text-3xl font-bold tracking-tight mt-2 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Compliance & Governance
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage global regulatory adherence, corporate policies, and automated governance rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Active Governance Rules"
          value={metrics.totalRules}
          icon={CheckCircle2}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Open Violations"
          value={metrics.openViolations}
          icon={AlertTriangle}
          iconColor="text-orange-500"
        />
        <MetricCard
          title="Critical Risk Issues"
          value={metrics.criticalIssues}
          icon={ShieldCheck}
          iconColor="text-red-500"
        />
      </div>

      {analyticsData && (
        <ComplianceAnalytics data={analyticsData} />
      )}

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2 mb-4 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="rules" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Governance Rules</TabsTrigger>
          <TabsTrigger value="violations" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Active Violations
            {violations.filter(v => v.status === 'open').length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                {violations.filter(v => v.status === 'open').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-slate-500" />
                <h3 className="font-bold text-slate-700 italic">Governance Policy Registry</h3>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rules..."
                    className="pl-9 h-9 w-[260px] bg-white border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="sm" className="h-9 gap-2 shadow-sm">
                      <Plus className="h-4 w-4" />
                      Add New Rule
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle className="text-xl font-bold border-b pb-4">Add Compliance Rule</SheetTitle>
                    </SheetHeader>
                    <div className="py-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="ruleName" className="text-sm font-semibold">Rule Name</Label>
                        <Input
                          id="ruleName"
                          placeholder="e.g. GDPR Data Retention"
                          value={newRule.ruleName}
                          onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jurisdiction" className="text-sm font-semibold">Jurisdiction / Framework</Label>
                        <Input
                          id="jurisdiction"
                          placeholder="e.g. Global, European Union"
                          value={newRule.jurisdiction}
                          onChange={(e) => setNewRule({ ...newRule, jurisdiction: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="risk" className="text-sm font-semibold">Inherent Risk Level</Label>
                        <Select
                          value={newRule.riskLevel}
                          onValueChange={(val: any) => setNewRule({ ...newRule, riskLevel: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Risk Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <SheetFooter className="border-t pt-4">
                      <Button className="w-full" onClick={() => createMutation.mutate(newRule)}>
                        Create Governance Rule
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            <StandardTable
              data={rules}
              columns={columns}
              isLoading={isLoading}
              filterColumn="ruleName"
            />
          </div>
        </TabsContent>

        <TabsContent value="violations">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="font-bold text-slate-700 italic">Active Violations & Remediation Queue</h3>
              </div>
            </div>
            <StandardTable
              data={violations}
              columns={violationColumns}
              filterColumn="ruleName"
            />
          </div>
        </TabsContent>
      </Tabs>

      <RemediationSheet
        violation={selectedViolation}
        onOpenChange={(open) => !open && setSelectedViolation(null)}
      />
    </div>
  );
}
