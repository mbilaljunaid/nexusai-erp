import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Flag, Plus, Search, RefreshCw, Gauge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  tenantId?: string | null;
  module?: string | null;
  rolloutPct?: number;
  createdAt?: string;
  updatedAt?: string;
}

const MODULE_COLORS: Record<string, string> = {
  AP: "bg-blue-100 text-blue-800",
  AR: "bg-violet-100 text-violet-800",
  GL: "bg-amber-100 text-amber-800",
  HR: "bg-green-100 text-green-800",
  FX: "bg-cyan-100 text-cyan-800",
  EPM: "bg-rose-100 text-rose-800",
  ALL: "bg-slate-100 text-slate-700",
};

export default function FeatureFlags() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newFlag, setNewFlag] = useState({ name: "", description: "", module: "ALL", rolloutPct: 100 });
  const [toggling, setToggling] = useState<string | null>(null);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const params = moduleFilter && moduleFilter !== "all" ? `?module=${moduleFilter}` : "";
      const res = await fetch(`/api/feature-flags${params}`);
      const json = await res.json();
      setFlags(Array.isArray(json.data) ? json.data : []);
    } catch {
      toast({ title: "Failed to load feature flags", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFlags(); }, [moduleFilter]);

  const handleToggle = async (flag: FeatureFlag) => {
    setToggling(flag.id);
    try {
      const res = await fetch(`/api/feature-flags/${flag.id}/toggle`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");
      const updated: FeatureFlag = await res.json();
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled: updated.enabled } : f)));
      toast({ title: `${updated.enabled ? "Enabled" : "Disabled"}: ${flag.name}` });
    } catch {
      toast({ title: "Toggle failed", variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newFlag, enabled: false }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Feature flag created" });
      setShowCreate(false);
      setNewFlag({ name: "", description: "", module: "ALL", rolloutPct: 100 });
      loadFlags();
    } catch {
      toast({ title: "Create failed", variant: "destructive" });
    }
  };

  const filtered = flags.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      (f.description ?? "").toLowerCase().includes(q)
    );
  });

  // Group by module
  const modules = [...new Set(filtered.map((f) => f.module || "ALL"))].sort();

  const enabledCount = filtered.filter((f) => f.enabled).length;
  const disabledCount = filtered.length - enabledCount;

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Flag className="h-8 w-8 text-blue-600" />
            Feature Flags
          </h1>
          <p className="text-muted-foreground mt-1">
            Control feature rollouts per tenant and module
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadFlags}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Flag
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Flags", value: flags.length, color: "text-blue-600" },
          { label: "Enabled", value: enabledCount, color: "text-green-600" },
          { label: "Disabled", value: disabledCount, color: "text-red-500" },
          { label: "Modules", value: [...new Set(flags.map((f) => f.module || "ALL"))].length, color: "text-amber-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={cn(`text-3xl font-bold ${color}`)}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search flags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {["AP", "AR", "GL", "HR", "FX", "EPM", "ALL"].map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Flags grouped by module */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No flags found.</div>
      ) : (
        <Accordion type="multiple" defaultValue={modules} className="space-y-2">
          {modules.map((mod) => {
            const modFlags = filtered.filter((f) => (f.module || "ALL") === mod);
            const modEnabled = modFlags.filter((f) => f.enabled).length;
            return (
              <AccordionItem key={mod} value={mod} className="border rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge className={MODULE_COLORS[mod] ?? "bg-slate-100"}>{mod}</Badge>
                    <span className="font-medium">{modFlags.length} flags</span>
                    <span className="text-xs text-muted-foreground">
                      {modEnabled} enabled / {modFlags.length - modEnabled} disabled
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pb-2">
                    {modFlags.map((flag) => (
                      <div
                        key={flag.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm font-medium truncate">{flag.name}</p>
                          {flag.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {flag.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            {flag.rolloutPct !== undefined && flag.rolloutPct < 100 && (
                              <div className="flex items-center gap-1 text-xs text-amber-600">
                                <Gauge className="h-3 w-3" />
                                {flag.rolloutPct}% rollout
                              </div>
                            )}
                            {flag.tenantId && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                tenant: {flag.tenantId}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <Badge
                            className={
                              flag.enabled
                                ? "bg-green-100 text-green-800"
                                : "bg-red-500/10 text-red-700"
                            }
                          >
                            {flag.enabled ? "On" : "Off"}
                          </Badge>
                          <Switch
                            checked={flag.enabled}
                            disabled={toggling === flag.id}
                            onCheckedChange={() => handleToggle(flag)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Feature Flag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Flag Name</Label>
              <Input
                placeholder="e.g. new_dashboard_v2"
                value={newFlag.name}
                onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">Description</Label>
              <Input
                placeholder="What does this flag control?"
                value={newFlag.description}
                onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Module</Label>
                <Select
                  value={newFlag.module}
                  onValueChange={(v) => setNewFlag({ ...newFlag, module: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["ALL", "AP", "AR", "GL", "HR", "FX", "EPM"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Rollout %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={newFlag.rolloutPct}
                  onChange={(e) =>
                    setNewFlag({ ...newFlag, rolloutPct: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newFlag.name.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
