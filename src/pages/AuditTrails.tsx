import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { StandardPage } from "@/components/layout/StandardPage";
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
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { MetricCard } from "@/components/MetricCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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

  const columns: SpreadsheetColumn<any>[] = [
    {
      id: "action",
      header: "Action / Event",
      width: "25%",
      cell: (l: any) => (
        <div className="p-2 flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              l.action === 'CREATE' ? 'border-green-200 bg-green-500/10 text-green-700' :
                l.action === 'DELETE' ? 'border-red-200 bg-red-500/10 text-red-700' :
                  'border-blue-200 bg-blue-500/10 text-blue-700'
            }
          >
            {l.action}
          </Badge>
          <span className="text-sm font-medium">{l.entityType}</span>
        </div>
      )
    },
    {
      id: "entityId",
      header: "Entity ID",
      width: "15%",
      cell: (l: any) => <div className="p-2"><span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{l.entityId}</span></div>
    },
    {
      id: "actorId",
      header: "Performed By",
      width: "20%",
      cell: (l: any) => (
        <div className="p-2 flex items-center gap-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{l.actorId}</span>
        </div>
      )
    },
    {
      id: "timestamp",
      header: "Timestamp",
      width: "25%",
      cell: (l: any) => (
        <div className="p-2 flex items-center gap-2 text-muted-foreground">
          <History className="h-3 w-3" />
          <span className="text-xs font-mono">
            {format(new Date(l.timestamp), 'MMM d, yyyy HH:mm:ss')}
          </span>
        </div>
      )
    },
    {
      id: "actions",
      header: "Traceability",
      width: "15%",
      cell: (l: any) => (
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/5"
            onClick={() => setSelectedEntry(l)}
          >
            <Database className="h-4 w-4" />
            View Details
          </Button>
        </div>
      )
    }
  ];

  return (
    <StandardPage
      title="AuditTrails"
      description=""
      className="space-y-6 container mx-auto"
    >
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

      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-foreground/90 italic">Audit Ledger</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by action, user, or ID..."
                className="pl-9 h-9 w-80 bg-card border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <InteractiveSpreadsheet
            data={logs.filter(log => log.action.toLowerCase().includes(searchTerm.toLowerCase()) || log.actorId.toLowerCase().includes(searchTerm.toLowerCase()) || log.entityId.toLowerCase().includes(searchTerm.toLowerCase()))}
            columns={columns}
            virtualized={true}
            containerHeight="600px"
            onChange={() => { }}
          />
        )}
      </Card>

      <AuditDetailsSideSheet
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      />
    </StandardPage>
  );
}
