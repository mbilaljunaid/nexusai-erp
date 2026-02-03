import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StandardTable } from "@/components/ui/StandardTable";
import { format } from "date-fns";
import { ClipboardList, History } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: transactions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hr/transactions"]
  });

  const columns = [
    {
      header: "Timestamp",
      accessorKey: "updatedAt",
      cell: (info: any) => format(new Date(info.getValue()), "MMM dd, yyyy HH:mm:ss"),
    },
    {
      header: "Employee",
      accessorKey: "personName",
    },
    {
      header: "Action",
      accessorKey: "assignmentStatus",
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${val === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {val}
          </span>
        );
      }
    },
    {
      header: "Department",
      accessorKey: "dept",
    },
    {
      header: "Updated By",
      accessorKey: "updatedBy",
    }
  ];

  return (
    <div className="space-y-6 container mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <Breadcrumb items={[{ label: "HR", path: "/hr" }, { label: "Audit Logs", path: "/hr/audit-logs" }]} />
          <h1 className="text-3xl font-bold tracking-tight mt-2 flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">Track system activities and HCM transactions across the enterprise.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Transactions"
          value={transactions.length}
          icon={History}
        />
        <MetricCard
          title="Security Alerts"
          value="0"
          icon={ClipboardList}
          change={0}
        />
        <MetricCard
          title="Data Integrity"
          value="99.9%"
          icon={ClipboardList}
        />
      </div>

      <StandardTable
        data={transactions}
        columns={columns}
        isLoading={isLoading}
        filterColumn="personName"
        filterPlaceholder="Search logs..."
      />
    </div>
  );
}
