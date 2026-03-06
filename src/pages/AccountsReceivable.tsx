import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArMetricCards } from "@/components/ar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { FileText, Users, Receipt, PieChart, BarChart, Activity, RefreshCw, Briefcase } from "lucide-react";
import { useState } from "react";
import { EnterpriseContextSwitcher } from "@/components/enterprise/EnterpriseContextSwitcher";

export default function AccountsReceivable() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [buId, setBuId] = useState<string>();

    const handleSeedData = async () => {
        try {
            await api.ar.seed();
            toast({ title: "AR Hierarchy Seeded", description: "Companies, Accounts, and Sites have been created with standard Oracle Parity." });
            window.location.reload();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const navigationCards = [
        {
            title: "Invoices",
            description: "Manage sales invoices, debit and credit memos",
            icon: FileText,
            href: "/finance/ar/invoices",
            color: "text-blue-600"
        },
        {
            title: "Customers",
            description: "Manage customer master data, accounts, and sites",
            icon: Users,
            href: "/finance/ar/customers",
            color: "text-emerald-600"
        },
        {
            title: "Receipts",
            description: "Process incoming payments and remittances",
            icon: Receipt,
            href: "/finance/ar/receipts",
            color: "text-purple-600"
        },
        {
            title: "Collections Workbench",
            description: "Manage overdue accounts and dunning",
            icon: Briefcase,
            href: "/finance/ar/collections",
            color: "text-orange-600"
        },
        {
            title: "Revenue Schedules",
            description: "Track deferred revenue and rule-based recognition",
            icon: PieChart,
            href: "/finance/ar/revenue-schedules",
            color: "text-indigo-600"
        },
        {
            title: "Disputes Workbench",
            description: "Manage IC disputes and resolutions",
            icon: Activity,
            href: "/finance/ic/disputes",
            color: "text-red-500"
        },
        {
            title: "Lockbox",
            description: "Auto-apply receipts from bank lockboxes",
            icon: RefreshCw,
            href: "/finance/ar/lockbox",
            color: "text-teal-600"
        },
        {
            title: "Analytics & Reports",
            description: "DSO tracking, aging, and predictive payment insights",
            icon: BarChart,
            href: "/finance/ar/analytics",
            color: "text-pink-600"
        }
    ];

    return (
        <StandardPage
            title="Accounts Receivable"
            description="Manage invoices, receipts, and customer accounts"
            actions={<Button onClick={handleSeedData} variant="outline" size="sm">Seed Data</Button>}
        >
            <div className="space-y-6">
                {/* Metric Cards */}
                <ArMetricCards buId={buId} />

                {/* Navigation Cards */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {navigationCards.map((card) => (
                            <Card
                                key={card.href}
                                className="cursor-pointer hover:shadow-md transition-shadow group"
                                onClick={() => setLocation(card.href)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className={cn(`p-2 rounded-lg bg-opacity-10 group-hover:bg-opacity-20 transition-colors ${card.color.replace('text-', 'bg-')}`)}>
                                            <card.icon className={cn(`h-6 w-6 ${card.color}`)} />
                                        </div>
                                        <CardTitle className="text-base">{card.title}</CardTitle>
                                    </div>
                                    <CardDescription className="mt-2">{card.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </StandardPage >
    );
}
