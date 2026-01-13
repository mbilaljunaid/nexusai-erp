import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, XCircle, ArrowRightLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { StandardTable } from "@/components/ui/StandardTable";
import { ColumnDef } from "@tanstack/react-table";

interface Requisition {
    id: number | string;
    reqNumber: string;
    description: string;
    totalAmount: number | string;
    status: string;
    createdAt: string;
}

export default function RequisitionBoard() {
    const { toast } = useToast();

    const { data: requisitions = [], isLoading } = useQuery<Requisition[]>({
        queryKey: ["/api/procurement/requisitions"],
        queryFn: () => fetch("/api/procurement/requisitions").then(r => r.json()).catch(() => [])
    });

    const reqAction = (id: string | number, action: string) => {
        fetch(`/api/procurement/requisitions/${id}/${action}`, { method: 'POST' })
            .then(() => {
                queryClient.invalidateQueries({ queryKey: ["/api/procurement/requisitions"] });
                if (action === 'convert-to-po') queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
                toast({ title: `Requisition ${action} successful` });
            });
    };

    const columns: ColumnDef<Requisition>[] = [
        {
            accessorKey: "reqNumber",
            header: "Req Number",
            cell: ({ row }) => <span className="font-semibold">{row.original.reqNumber}</span>
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => <span>{row.original.description}</span>
        },
        {
            accessorKey: "totalAmount",
            header: "Total",
            cell: ({ row }) => <span>${Number(row.original.totalAmount).toLocaleString()}</span>
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={
                    row.original.status === 'Approved' ? 'default' :
                        row.original.status === 'Rejected' ? 'destructive' :
                            'outline'
                }>
                    {row.original.status}
                </Badge>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2 justify-end">
                    {row.original.status === 'Draft' && (
                        <Button size="sm" variant="outline" onClick={() => reqAction(row.original.id, 'submit')}>Submit</Button>
                    )}
                    {row.original.status === 'Pending Approval' && (
                        <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => reqAction(row.original.id, 'approve')}>
                                <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8" onClick={() => reqAction(row.original.id, 'reject')}>
                                <XCircle className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                    {row.original.status === 'Approved' && (
                        <Button size="sm" variant="secondary" onClick={() => reqAction(row.original.id, 'convert-to-po')}>
                            <ArrowRightLeft className="w-4 h-4 mr-1" /> To PO
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Requisitions"
            subtitle="Track and manage internal purchase requests"
            actions={
                <Link href="/procurement/requisitions/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Request
                    </Button>
                </Link>
            }
        >
            <StandardTable
                data={requisitions}
                columns={columns}
                isLoading={isLoading}
                filterColumn="reqNumber"
                filterPlaceholder="Search requisitions..."
            />
        </StandardPage>
    );
}
