import { cn } from "@/lib/utils";
import React from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Building, Building2, BookOpen, Share2 } from "lucide-react";

export default function EnterpriseDashboard() {
    const [, setLocation] = useLocation();

    // Fetch high-level stats
    const { data: legalGroups } = useQuery<any>({
        queryKey: ["/api/enterprise/legal-groups"],
        queryFn: () => fetch("/api/enterprise/legal-groups").then(r => r.json())
    });

    const { data: businessUnits } = useQuery<any>({
        queryKey: ["/api/enterprise/business-units"],
        queryFn: () => fetch("/api/enterprise/business-units").then(r => r.json())
    });

    const navigationCards = [
        {
            title: "Legal Groups",
            description: "Manage Legal Entities, Company Names, and Registrations",
            icon: Building2,
            href: "/company-setup/legal-groups",
            color: "text-blue-600",
            count: legalGroups?.length || 0
        },
        {
            title: "Business Units",
            description: "Define Business Units, Divisions, and Operational Nodes",
            icon: Building,
            href: "/company-setup/business-units",
            color: "text-green-600",
            count: businessUnits?.length || 0
        },
        {
            title: "Ledgers",
            description: "View existing Financial Ledgers",
            icon: BookOpen,
            href: "/company-setup/ledgers",
            color: "text-purple-600",
            count: "-"
        },
        {
            title: "Enterprise Mappings",
            description: "Map Legal Groups to BUs, and BUs to Ledgers",
            icon: Share2,
            href: "/company-setup/mappings",
            color: "text-orange-600",
            count: "-"
        }
    ];

    return (
        <StandardPage
            title="Company Setup"
            description="Manage Enterprise Structures, Legal Entities, Business Units, and Mappings"
            breadcrumbs={[{ label: "Configuration" }, { label: "Company Setup" }]}
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Enterprise Architecture Elements</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {navigationCards.map((card) => (
                            <Card
                                key={card.href}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => setLocation(card.href)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                            >
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="flex items-center gap-3">
                                        <card.icon className={cn(`h-6 w-6 ${card.color}`)} />
                                        <CardTitle className="text-base">{card.title}</CardTitle>
                                    </div>
                                    <span className="text-2xl font-bold text-muted-foreground">{card.count}</span>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{card.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <Card className="bg-slate-500/10 border-slate-200">
                    <CardHeader>
                        <CardTitle>Enterprise Architecture Overview</CardTitle>
                        <CardDescription>Core structural components and their scoping boundaries</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Card className="flex items-start gap-4 p-4 shadow-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold shrink-0">GL</div>
                            <div>
                                <h4 className="font-semibold">Ledger</h4>
                                <p className="text-sm text-muted-foreground mt-1">The ultimate financial repository. Defines the 4 Cs (Chart of Accounts, Currency, Calendar, Convention).</p>
                            </div>
                        </Card>

                        <Card className="flex items-start gap-4 p-4 shadow-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold shrink-0">LE</div>
                            <div>
                                <h4 className="font-semibold">Legal Entity</h4>
                                <p className="text-sm text-muted-foreground mt-1">A recognized legal body. Generally mapped to a Ledger. Owns the tax, HR/Payroll, and statutory reporting obligations.</p>
                            </div>
                        </Card>

                        <Card className="flex items-start gap-4 p-4 shadow-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700 font-bold shrink-0">BU</div>
                            <div>
                                <h4 className="font-semibold">Business Unit</h4>
                                <p className="text-sm text-muted-foreground mt-1">(Formerly Operating Unit). Scopes subledger financial transactions (AP, AR, Procurement, Order Management). A BU processes transactions and posts the financial impact to a specific Primary Ledger. A BU is usually associated with a Primary Legal Entity.</p>
                            </div>
                        </Card>

                        <Card className="flex items-start gap-4 p-4 shadow-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700 font-bold shrink-0">INV</div>
                            <div>
                                <h4 className="font-semibold">Inventory Organization</h4>
                                <p className="text-sm text-muted-foreground mt-1">Scopes physical material, manufacturing, and supply chain operations. Rolls up to a BU (for financial tracking) and a Ledger.</p>
                            </div>
                        </Card>

                        <Card className="flex items-start gap-4 p-4 shadow-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold shrink-0">REF</div>
                            <div>
                                <h4 className="font-semibold">Reference Data Set (SetID)</h4>
                                <p className="text-sm text-muted-foreground mt-1">Used to share master data (like Customer or Supplier definitions) across multiple BUs.</p>
                            </div>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
