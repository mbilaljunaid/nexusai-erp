import { useState } from "react";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText } from "lucide-react";
import { useLocation } from "wouter";

export default function APInvoices() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [accountingModalOpen, setAccountingModalOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ data: any[], total: number }>({
    queryKey: ["/api/ap/invoices", page, pageSize],
    queryFn: () => fetch(`/api/ap/invoices?limit=${pageSize}&offset=${(page - 1) * pageSize}`).then(r => r.json()),
  });

  const columns: Column<any>[] = [
    { header: "Invoice #", accessorKey: "invoiceNumber", className: "font-mono font-medium" },
    { header: "Supplier", accessorKey: "supplier.name" },
    { header: "Amount", accessorKey: "invoiceAmount", cell: (row) => `$${parseFloat(row.invoiceAmount).toFixed(2)}` },
    { header: "Status", accessorKey: "invoiceStatus", cell: (row) => <Badge>{row.invoiceStatus}</Badge> },
    { header: "Validation", accessorKey: "validationStatus", cell: (row) => <Badge variant="outline">{row.validationStatus}</Badge> },
    {
      id: "actions",
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEntityId(row.id);
            setAccountingModalOpen(true);
          }}
          title="View Accounting"
        >
          <FileText className="h-4 w-4 text-muted-foreground hover:text-primary" />
        </Button>
      )
    }
  ];

  return (
    <StandardPage
      title="Accounts Payable Invoices"
      description="Manage vendor invoices and payments"
      breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Invoices" }]}
      actions={
        <Button onClick={() => setLocation("/finance/ap/invoices/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      }
    >
      <StandardTable
        data={data?.data || []}
        columns={columns}
        totalItems={data?.total || 0}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        isLoading={isLoading}
      />

      <ViewAccountingModal
        open={accountingModalOpen}
        onOpenChange={setAccountingModalOpen}
        entityId={selectedEntityId}
      />
    </StandardPage>
  );
}
