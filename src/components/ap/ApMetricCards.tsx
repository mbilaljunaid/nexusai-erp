import { cn } from "@/lib/utils";
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
import { formatNumber } from '@/lib/formatters';

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
            value: `$${formatNumber(cashOutflow)}`,
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
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <div className="mt-2">
                            <Skeleton className="h-8 w-14 mb-2" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </DashboardWidget>
                ))}
            </>
        );
    }

    return (
        <>
            {cards.map((card, idx) => {
                const borderColor = card.color.includes('red') ? 'border-red-500'
                    : card.color.includes('emerald') ? 'border-emerald-500'
                        : card.color.includes('amber') ? 'border-amber-500'
                            : 'border-blue-500';

                return (
                    <DashboardWidget key={idx} colSpan={1} className={cn(`relative overflow-hidden border-l-4 ${borderColor}`)}>
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </h3>
                            <div className={cn(`p-2 rounded-full ${card.bg}`)}>
                                <card.icon className={cn(`h-4 w-4 ${card.color}`)} />
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
                );
            })}
        </>
    );
}
