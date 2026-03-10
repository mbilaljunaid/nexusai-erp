import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";
import { formatNumber } from '@/lib/formatters';

export function ArMetricCards({ buId }: { buId?: string }) {
    const scopeHeaders = buildScopeHeaders({ "business-unit": buId });

    const { data: invoices } = useQuery({
        queryKey: ["/api/ar/invoices", buId],
        queryFn: () => fetch("/api/ar/invoices", { headers: scopeHeaders }).then(r => r.json())
    });

    const metrics = {
        totalOutstanding: 0,
        overdue: 0,
        paidThisMonth: 0,
        averageDso: 15 // Mock DSO
    };

    if (Array.isArray(invoices)) {
        invoices.forEach((inv: any) => {
            const amount = parseFloat(inv.totalAmount);
            if (inv.status !== "Paid" && inv.status !== "Cancelled") {
                metrics.totalOutstanding += amount;
                if (new Date(inv.dueDate) < new Date() && inv.status !== "Sent") {
                    metrics.overdue += amount;
                }
            }
            if (inv.status === "Paid") {
                metrics.paidThisMonth += amount; // Simplified for demo
            }
        });
    }

    const cards = [
        {
            title: "Total Outstanding",
            value: `$${formatNumber(metrics.totalOutstanding)}`,
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-500/10",
            description: "Total unpaid sales invoices"
        },
        {
            title: "Overdue Amount",
            value: `$${formatNumber(metrics.overdue)}`,
            icon: AlertCircle,
            color: "text-rose-600",
            bg: "bg-rose-500/10",
            description: "Invoices past their due date"
        },
        {
            title: "Collected (MTD)",
            value: `$${formatNumber(metrics.paidThisMonth)}`,
            icon: CheckCircle2,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            description: "Total receipts this month"
        },
        {
            title: "Avg. DSO",
            value: `${metrics.averageDso} Days`,
            icon: TrendingUp,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
            description: "Days Sales Outstanding"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <div className={cn(`p-2 rounded-lg ${card.bg}`)}>
                            <card.icon className={cn(`h-4 w-4 ${card.color}`)} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
