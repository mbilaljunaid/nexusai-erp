import { StandardTable } from "@/components/ui/StandardTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Building2, Shield, ArrowRight, AlertOctagon } from "lucide-react";
import { useState } from "react";
import { ApSupplier } from "@shared/schema";
import { ApSideSheet } from "./ApSideSheet";
import { apiRequest } from "@/lib/queryClient";

async function fetchSuppliers() {
    const res = await apiRequest("GET", "/api/ap/suppliers");
    return res.json();
}

export function ApSupplierList() {
    const { data: suppliers = [], isLoading } = useQuery<ApSupplier[]>({
        queryKey: ['/api/ap/suppliers'],
        queryFn: fetchSuppliers
    });

    const [selectedSupplier, setSelectedSupplier] = useState<ApSupplier | null>(null);

    const columns: ColumnDef<ApSupplier>[] = [
        {
            accessorKey: "name",
            header: "Supplier Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Building2 className={`h-4 w-4 ${row.original.creditHold ? "text-red-500" : "text-purple-500"}`} />
                    <span className="font-semibold">{row.original.name}</span>
                </div>
            )
        },
        {
            accessorKey: "taxId",
            header: "Tax ID",
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.taxId || 'N/A'}</span>
        },
        {
            accessorKey: "riskCategory",
            header: "Risk Level",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Badge variant={
                        row.original.riskCategory === "High" ? "destructive" :
                            row.original.riskCategory === "Medium" ? "secondary" : "outline"
                    }>
                        {row.original.riskCategory || "Low"}
                    </Badge>
                    {row.original.riskCategory === "High" && (
                        <Shield className="h-3 w-3 text-red-500" />
                    )}
                </div>
            )
        },
        {
            accessorKey: "creditHold",
            header: "Status",
            cell: ({ row }) => (
                row.original.creditHold ? (
                    <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                        <AlertOctagon className="h-3 w-3" /> Credit Hold
                    </span>
                ) : (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        Active
                    </span>
                )
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setSelectedSupplier(row.original); }}
                    >
                        Details <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
            <StandardTable
                data={suppliers}
                columns={columns}
                isLoading={isLoading}
                filterColumn="name"
                filterPlaceholder="Search suppliers..."
                onRowClick={(row) => setSelectedSupplier(row)}
            />

            <ApSideSheet
                open={!!selectedSupplier}
                onOpenChange={(open) => !open && setSelectedSupplier(null)}
                supplier={selectedSupplier || undefined}
                type="supplier"
            />
        </>
    );
}
