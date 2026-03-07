import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Receipt, CheckCircle2, AlertCircle, Zap, ArrowRight, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';


export default function FreightSettlementConsole() {
    const { toast } = useToast();

    const { data: charges, isLoading } = useQuery<any>({
        queryKey: ["/api/transportation/charges"],
        queryFn: () => fetch("/api/transportation/charges").then(res => res.json())
    });

    const { data: accruals } = useQuery<any>({
        queryKey: ["/api/transportation/settlement/accruals"],
        queryFn: () => fetch("/api/transportation/settlement/accruals").then(res => res.json())
    });

    const reconcileMutation = useMutation({
        mutationFn: ({ id, amount }: { id: string, amount: number }) =>
            fetch(`/api/transportation/charges/${id}/reconcile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoiceAmount: amount })
            }).then(res => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/transportation/charges"] });
            toast({ title: "Charge Reconciled", description: "The freight charge status has been updated." });
        }
    });

    const interfaceMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/transportation/charges/${id}/interface`, { method: "POST" }).then(res => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/transportation/charges"] });
            toast({ title: "Interfaced to AP", description: "Freight invoice created in Accounts Payable." });
        }
    });

    const columns = [
        { id: "id", header: "Charge ID", width: "100px", cell: (info: any) => <div className="px-2 h-full flex items-center font-mono text-xs">{String(info.id || "").slice(0, 8)}</div> },
        { id: "shipmentId", header: "Shipment #", width: "150px", cell: (info: any) => <div className="px-2 h-full flex items-center"><Badge variant="outline">SHP-{String(info.shipmentId || "").slice(0, 6)}</Badge></div> },
        {
            id: "plannedAmount",
            header: "Planned",
            width: "120px",
            cell: (info: any) => <div className="px-2 h-full flex items-center">${formatNumber(Number(info.plannedAmount || 0))}</div>
        },
        {
            id: "actualAmount",
            header: "Actual",
            width: "120px",
            cell: (info: any) => <div className="px-2 h-full flex items-center">{info.actualAmount ? (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-600">${formatNumber(Number(info.actualAmount || 0))}</span>
                </div>
            ) : <span className="text-muted-foreground italic">Awaiting Invoice</span>}</div>
        },
        {
            id: "varianceAmount",
            header: "Variance",
            width: "120px",
            cell: (info: any) => <div className="px-2 h-full flex items-center">{info.varianceAmount ? (
                <span className={cn(
                    "font-bold",
                    Number(info.varianceAmount) > 0 ? "text-amber-600" : "text-emerald-600"
                )}>
                    {Number(info.varianceAmount) > 0 ? "+" : ""}{formatNumber(Number(info.varianceAmount))}
                </span>
            ) : "-"}</div>
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (info: any) => (
                <div className="px-2 h-full flex items-center">
                    <Badge variant={
                        info.status === "MATCHED" ? "success" :
                            info.status === "DISPUTED" ? "destructive" :
                                info.status === "PAID" ? "default" : "secondary"
                    }>
                        {info.status}
                    </Badge>
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            width: "250px",
            cell: (info: any) => (
                <div className="px-2 h-full flex items-center gap-2">
                    {info.status === "ACCRUED" && (
                        <Button
                            size="xs"
                            variant="glow"
                            onClick={() => reconcileMutation.mutate({ id: info.id, amount: Number(info.plannedAmount) })}
                        >
                            Auto-Match
                        </Button>
                    )}
                    {info.status === "MATCHED" && (
                        <Button
                            size="xs"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => interfaceMutation.mutate(info.id)}
                        >
                            Pay Carrier
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <StandardPage title="Freight Settlement Console">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground">Manage carrier billing, automated reconciliation, and AP integration.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <ArrowRight className="mr-2 h-4 w-4" /> Export for GL
                    </Button>
                    <Button variant="premium">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Batch Reconcile AI
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-premium bg-emerald-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            Ready for Payment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">$142,500.00</div>
                        <p className="text-xs text-emerald-700/70 mt-1">12 Invoices validated vs agreements</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-premium bg-amber-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            Exceptions & Disputes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-amber-900 dark:text-amber-200">$6,840.00</div>
                        <p className="text-xs text-amber-700/70 mt-1">3 variances exceeding 5% tolerance</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-premium bg-indigo-500/10 backdrop-blur-sm border border-indigo-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-indigo-600" />
                            Accrued Freight Liability
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-indigo-900 dark:text-indigo-200">
                            ${(accruals?.total || 45800).toLocaleString()}.00
                        </div>
                        <p className="text-xs text-indigo-700/70 mt-1">Estimated cost of in-transit shipments</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-premium bg-card/50 backdrop-blur-xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                        Freight Invoice Workbench
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[400px]">
                    <InteractiveSpreadsheet
                        data={charges || []}
                        columns={columns}
                        onChange={() => { }}
                        virtualized={true}
                        containerHeight="400px"
                    />
                </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl flex items-center justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 opacity-80">
                        <Zap className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Powered by Oracle Parity Engine</span>
                    </div>
                    <h3 className="text-2xl font-bold">Automated General Ledger Posting</h3>
                    <p className="text-indigo-100 max-w-xl text-sm italic opacity-90">
                        "Freight charges are automatically accrued upon shipment planning and reversed during settlement to ensure accurate financial reporting at every stage of the lifecycle."
                    </p>
                </div>
                <Button className="bg-white text-indigo-600 hover:bg-white/90 font-bold px-8 shadow-lg">
                    Reconcile GL
                </Button>
            </div>
        </StandardPage>
    );
}

// Helper for classNames (mock if not available)
const cn = (...args: any[]) => args.filter(Boolean).join(" ");
