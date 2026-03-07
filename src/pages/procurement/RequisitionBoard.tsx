import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, XCircle, ArrowRightLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { formatNumber } from '@/lib/formatters';

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
    });

    const reqAction = (id: string | number, action: string) => {
        fetch(`/api/procurement/requisitions/${id}/${action}`, { method: 'POST' })
            .then(() => {
                queryClient.invalidateQueries({ queryKey: ["/api/procurement/requisitions"] });
                if (action === 'convert-to-po') queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
                toast({ title: `Requisition ${action} successful` });
            });
    };

    const columns: SpreadsheetColumn<Requisition>[] = [
        {
            id: "reqNumber", width: "150px",
            header: "Req Number",
            cell: (item) => <span className="font-semibold">{item.reqNumber}</span>
        },
        {
            id: "description", width: "150px",
            header: "Description",
            cell: (item) => <span>{item.description}</span>
        },
        {
            id: "totalAmount", width: "150px",
            header: "Total",
            cell: (item) => <span>${formatNumber(Number(item.totalAmount))}</span>
        },
        {
            id: "status", width: "150px",
            header: "Status",
            cell: (item) => (
                <Badge variant={
                    item.status === 'Approved' ? 'default' :
                        item.status === 'Rejected' ? 'destructive' :
                            'outline'
                }>
                    {item.status}
                </Badge>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: (item) => (
                <div className="flex gap-2 justify-end">
                    {item.status === 'Draft' && (
                        <Button size="sm" variant="outline" onClick={() => reqAction(item.id, 'submit')}>Submit</Button>
                    )}
                    {item.status === 'Pending Approval' && (
                        <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => reqAction(item.id, 'approve')}>
                                <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8" onClick={() => reqAction(item.id, 'reject')}>
                                <XCircle className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                    {item.status === 'Approved' && (
                        <Button size="sm" variant="secondary" onClick={() => reqAction(item.id, 'convert-to-po')}>
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
            description="Track and manage internal purchase requests"
            actions={
                <Link href="/procurement/requisitions/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Request
                    </Button>
                </Link>
            }
        >
            <InteractiveSpreadsheet
                data={requisitions}
                columns={columns}
                isLoading={isLoading}
             onChange={() => {}} containerHeight="600px" />
        </StandardPage>
    );
}
