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
import { RuleBuilder } from "@/components/compliance/RuleBuilder";
import { RegulatoryReadinessReport } from "@/components/compliance/RegulatoryReadinessReport";
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
  name: string;
  legislationCode: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
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
  const [newRule, setNewRule] = useState({
    code: "RULE-" + Date.now(),
    name: "",
    legislationCode: "GLOBAL",
    severity: "medium",
    category: "REGULATORY",
    automationLevel: "full",
    ruleLogic: {} as any,
    effectiveDate: new Date().toISOString()
  });
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  const { data: rules = [], isLoading } = useQuery<ComplianceRule[]>({
    queryKey: ["/api/hr/compliance-rules"],
    queryFn: () => fetch("/api/hr/compliance-rules").then(r => r.json()),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/hr/compliance/analytics"],
    queryFn: () => fetch("/api/hr/compliance/analytics").then(r => r.json()),
  });

  const [violationPage, setViolationPage] = useState(1);
  const violationLimit = 20;

  const { data: violationsData = { data: [], total: 0 }, isLoading: isViolationsLoading } = useQuery<{ data: Violation[], total: number }>({
    queryKey: ["/api/hr/compliance/violations", { page: violationPage, limit: violationLimit }],
    queryFn: () => fetch(`/api/hr/compliance/violations?page=${violationPage}&limit=${violationLimit}`).then(r => r.json()),
  });

  const violations = violationsData.data;
  const totalViolations = violationsData.total;

  const metrics = analyticsData?.metrics || { totalRules: 0, openViolations: 0, criticalIssues: 0 };

  const createMutation = useMutation({
    mutationFn: (data: typeof newRule) => fetch("/api/hr/compliance-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/compliance-rules"] });
      setNewRule({
        code: "RULE-" + Date.now(),
        name: "",
        legislationCode: "GLOBAL",
        severity: "medium",
        category: "REGULATORY",
        automationLevel: "full",
        ruleLogic: {} as any,
        effectiveDate: new Date().toISOString()
      });
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
      accessorKey: "name",
      cell: (r: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{r.name}</span>
          <span className="text-xs text-muted-foreground font-mono">{r.id.substring(0, 8)}</span>
        </div>
      )
    },
    {
      header: "Legislation",
      accessorKey: "legislationCode",
      cell: (r: any) => <Badge variant="outline" className="bg-slate-50">{r.legislationCode}</Badge>
    },
    {
      header: "Risk Level",
      accessorKey: "severity",
      cell: (r: any) => (
        <Badge variant={r.severity === "high" || r.severity === "critical" ? "destructive" : r.severity === "medium" ? "secondary" : "default"}>
          {(r.severity || "MEDIUM").toUpperCase()}
        </Badge>
      )
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (r: any) => <span className="text-xs font-semibold text-slate-500">{r.category}</span>
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
        <TabsList className="grid w-[600px] grid-cols-3 mb-4 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="rules" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Governance Rules</TabsTrigger>
          <TabsTrigger value="violations" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Active Violations
            {violations.filter(v => v.status === 'open').length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                {violations.filter(v => v.status === 'open').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="readiness" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Regulatory Readiness</TabsTrigger>
          <TabsTrigger value="risk_config" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Risk Configuration</TabsTrigger>
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
                    <div className="py-6 space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                      <div className="space-y-4 border-b pb-6">
                        <div className="space-y-2">
                          <Label htmlFor="ruleName" className="text-sm font-bold">Rule Name</Label>
                          <Input
                            id="ruleName"
                            placeholder="e.g. US SSN Validation"
                            value={newRule.name}
                            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-bold">Legislation</Label>
                            <Select
                              value={newRule.legislationCode}
                              onValueChange={(val) => setNewRule({ ...newRule, legislationCode: val })}
                            >
                              <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GLOBAL">Global</SelectItem>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="UK">United Kingdom</SelectItem>
                                <SelectItem value="EU">European Union</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-bold">Risk Level</Label>
                            <Select
                              value={newRule.severity}
                              onValueChange={(val) => setNewRule({ ...newRule, severity: val })}
                            >
                              <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue />
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
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-extrabold text-slate-900 italic">Rule Configuration</Label>
                        <RuleBuilder
                          legislationCode={newRule.legislationCode}
                          onSave={(logic) => {
                            setNewRule(prev => ({ ...prev, ruleLogic: logic }));
                            toast({ title: "Logic Generated", description: "Rule evaluation strategy attached." });
                          }}
                        />
                      </div>
                    </div>
                    <SheetFooter className="border-t pt-6 bg-slate-50/50 -mx-6 px-6 -mb-6 pb-6">
                      <Button
                        className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg ring-offset-2 ring-indigo-500 focus:ring-2"
                        onClick={() => createMutation.mutate(newRule)}
                        disabled={!newRule.name || !newRule.ruleLogic?.type}
                      >
                        Deploy Governance Rule
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
              filterColumn="name"
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
              totalCount={totalViolations}
              page={violationPage}
              onPageChange={setViolationPage}
              isLoading={isViolationsLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="risk_config">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Weighted Heuristic Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              {[
                { key: "TENURE_VOLATILITY", label: "Tenure Volatility", description: "Impact of frequent job changes in short periods." },
                { key: "TRANSACTION_TIMING", label: "Transaction Timing", description: "Risk weight for off-hours system activity." },
                { key: "ROLE_SENSITIVITY", label: "Role Sensitivity", description: "Weight for access to sensitive financial/admin roles." },
                { key: "TRANSFER_FREQUENCY", label: "Transfer Frequency", description: "Weight for multiple organization transfers." }
              ].map((factor) => (
                <div key={factor.key} className="space-y-4 p-4 border rounded-xl bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <Label className="font-bold text-slate-800">{factor.label}</Label>
                      <p className="text-xs text-muted-foreground">{factor.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-white">Weight: 25</Badge>
                  </div>
                  <div className="pt-2">
                    <input
                      type="range"
                      id={`risk-factor-${factor.key}`}
                      title={factor.label}
                      className="w-full accent-indigo-600"
                      min="0"
                      max="100"
                      defaultValue="25"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t pt-6 flex justify-end">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Save Risk Strategy</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="readiness">
          {analyticsData && (
            <RegulatoryReadinessReport data={analyticsData} />
          )}
        </TabsContent>
      </Tabs>

      <RemediationSheet
        violation={selectedViolation}
        onOpenChange={(open) => !open && setSelectedViolation(null)}
      />
    </div>
  );
}
