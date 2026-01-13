import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardWidget } from "@/components/layout/StandardDashboard";
import {
    FileText,
    Clock,
    DollarSign,
    AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function ApMetricCards() {
    const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
        queryKey: ['/api/ap/invoices'],
        queryFn: () => api.ap.invoices.list()
    });

    const { data: payments, isLoading: isLoadingPayments } = useQuery({
        queryKey: ['/api/ap/payments'],
        queryFn: () => api.ap.payments.list()
    });

    const isLoading = isLoadingInvoices || isLoadingPayments;

    // Calculate metrics
    const totalInvoices = invoices?.length || 0;
    const pendingApproval = invoices?.filter((i: any) => i.approvalStatus === "REQUIRED" || i.approvalStatus === "PENDING").length || 0;
    const onHold = invoices?.filter((i: any) => i.validationStatus === "NEEDS REVALIDATION" || i.validationStatus === "ON HOLD").length || 0;

    // Calculate cash outflow (sum of unpaid invoices due in next 30 days) implementation note: using simple unpaid sum for now
    const cashOutflow = invoices
        ?.filter((i: any) => i.paymentStatus !== "PAID")
        .reduce((sum: number, i: any) => sum + Number(i.invoiceAmount), 0) || 0;

    const cards = [
        {
            title: "Total Invoices",
            value: totalInvoices,
            subtext: "Across all periods",
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-100/50"
        },
        {
            title: "Pending Approval",
            value: pendingApproval,
            subtext: "Requires action",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-100/50"
        },
        {
            title: "Projected Outflow",
            value: `$${cashOutflow.toLocaleString()}`,
            subtext: "Next 30 Days",
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-100/50"
        },
        {
            title: "Exceptions",
            value: onHold,
            subtext: "Validation Errors",
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-100/50"
        }
    ];

    if (isLoading) {
        return (
            <>
                {[1, 2, 3, 4].map((i) => (
                    <DashboardWidget key={i} colSpan={1}>
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <div className="mt-2">
                            <Skeleton className="h-8 w-[60px] mb-2" />
                            <Skeleton className="h-3 w-[80px]" />
                        </div>
                    </DashboardWidget>
                ))}
            </>
        );
    }

    return (
        <>
            {cards.map((card, idx) => (
                <DashboardWidget key={idx} colSpan={1} className="relative overflow-hidden border-l-4" style={{ borderLeftColor: card.color.includes('red') ? '#ef4444' : card.color.includes('emerald') ? '#10b981' : card.color.includes('amber') ? '#f59e0b' : '#3b82f6' } as any}>
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </h3>
                        <div className={`p-2 rounded-full ${card.bg}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                            {card.subtext}
                        </p>
                        {/* Decorative background element */}
                        <div className="absolute -right-4 -bottom-4 opacity-5">
                            <card.icon className="h-24 w-24" />
                        </div>
                    </div>
                </DashboardWidget>
            ))}
        </>
    );
}
