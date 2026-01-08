import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

export function ArMetricCards() {
    const { data: invoices } = useQuery({
        queryKey: ["/api/ar/invoices"],
        queryFn: api.ar.invoices.list
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
            value: `$${metrics.totalOutstanding.toLocaleString()}`,
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            description: "Total unpaid sales invoices"
        },
        {
            title: "Overdue Amount",
            value: `$${metrics.overdue.toLocaleString()}`,
            icon: AlertCircle,
            color: "text-rose-600",
            bg: "bg-rose-50",
            description: "Invoices past their due date"
        },
        {
            title: "Collected (MTD)",
            value: `$${metrics.paidThisMonth.toLocaleString()}`,
            icon: CheckCircle2,
            color: "text-blue-600",
            bg: "bg-blue-50",
            description: "Total receipts this month"
        },
        {
            title: "Avg. DSO",
            value: `${metrics.averageDso} Days`,
            icon: TrendingUp,
            color: "text-amber-600",
            bg: "bg-amber-50",
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
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
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
