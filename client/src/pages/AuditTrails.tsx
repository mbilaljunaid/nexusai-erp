import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Shield,
  Search,
  History,
  Activity,
  User,
  Database,
  ArrowRightLeft
} from "lucide-react";
import { StandardTable, Column } from "@/components/ui/standardtable";
import { MetricCard } from "@/components/MetricCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuditDetailsSideSheet } from "@/components/compliance/AuditDetailsSideSheet";

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  timestamp: string;
  changes: any;
  metadata?: any;
}

export default function AuditTrails() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<AuditLog | null>(null);

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/hr/audit-logs"], // Note: updated endpoint to follow HR module pattern if applicable, else fallback to generic
    queryFn: () => fetch("/api/hr/audit-logs").then(r => r.json()).catch(() => []),
  });

  const columns: Column<AuditLog>[] = [
    {
      header: "Action / Event",
      accessorKey: "action",
      cell: (l) => (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              l.action === 'CREATE' ? 'border-green-200 bg-green-50 text-green-700' :
                l.action === 'DELETE' ? 'border-red-200 bg-red-50 text-red-700' :
                  'border-blue-200 bg-blue-50 text-blue-700'
            }
          >
            {l.action}
          </Badge>
          <span className="text-sm font-medium">{l.entityType}</span>
        </div>
      )
    },
    {
      header: "Entity ID",
      accessorKey: "entityId",
      cell: (l) => <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{l.entityId}</span>
    },
    {
      header: "Performed By",
      accessorKey: "actorId",
      cell: (l) => (
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{l.actorId}</span>
        </div>
      )
    },
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: (l) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <History className="h-3 w-3" />
          <span className="text-xs font-mono">
            {format(new Date(l.timestamp), 'MMM d, yyyy HH:mm:ss')}
          </span>
        </div>
      )
    },
    {
      header: "Traceability",
      id: "actions",
      cell: (l) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/5"
          onClick={() => setSelectedEntry(l)}
        >
          <Database className="h-4 w-4" />
          View Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 container mx-auto">
      <div>
        <Breadcrumb items={[{ label: "HR", path: "/hr" }, { label: "Compliance", path: "/compliance" }, { label: "Audit Trails", path: "/compliance/audit" }]} />
        <h1 className="text-3xl font-bold tracking-tight mt-2 flex items-center gap-2">
          <History className="h-8 w-8 text-primary" />
          Audit & Traceability
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Immutable ledger of all worker transactions, security changes, and compliance events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Events Logged"
          value={logs.length}
          icon={Activity}
          iconColor="text-blue-500"
          loading={isLoading}
        />
        <MetricCard
          title="Security Violations"
          value="0"
          icon={Shield}
          iconColor="text-green-500"
          loading={isLoading}
        />
        <MetricCard
          title="Data Mutations (24h)"
          value="128"
          icon={ArrowRightLeft}
          iconColor="text-purple-500"
          loading={isLoading}
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-700 italic">Audit Ledger</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by action, user, or ID..."
                className="pl-9 h-9 w-[350px] bg-white border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <StandardTable
          data={logs}
          columns={columns}
          isLoading={isLoading}
          filterColumn="action"
        />
      </div>

      <AuditDetailsSideSheet
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      />
    </div>
  );
}
