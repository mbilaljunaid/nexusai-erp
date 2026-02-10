import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import {
    ArMetricCards,
    ArInvoiceList,
    ArCustomerList,
    ArReceiptList,
    ArTransactionDialog,
    ArRevenueWorkbench,
    ArCollectionsDashboard,
    ArSystemOptionsComponent,
    ArCreditManagement,
    ArRevenueRules
} from "@/components/ar";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function AccountsReceivable() {
    const [activeTab, setActiveTab] = useState("invoices");
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleSeedData = async () => {
        try {
            await api.ar.seed();
            toast({ title: "AR Hierarchy Seeded", description: "Companies, Accounts, and Sites have been created with standard Oracle Parity." });
            window.location.reload();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    return (
        <StandardPage
            title="Accounts Receivable"
            description="Track customer billing, sales invoices, and incoming receipts with AI assistance."
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Accounts Receivable" }]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSeedData}>
                        Seed Demo Data
                    </Button>
                    <Button
                        onClick={() => setIsTransactionDialogOpen(true)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="mr-2 h-4 w-4" /> New AR Transaction
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Metric Cards */}
                <ArMetricCards />

                {/* Main Content Tabs */}
                <Tabs defaultValue="invoices" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1 border shadow-sm rounded-lg w-auto">
                            <TabsTrigger value="invoices" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Invoices</TabsTrigger>
                            <TabsTrigger value="customers" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Customers</TabsTrigger>
                            <TabsTrigger value="receipts" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Receipts</TabsTrigger>
                            <TabsTrigger value="credit" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Credit Mgmt</TabsTrigger>
                            <TabsTrigger value="revenue" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Revenue</TabsTrigger>
                            <TabsTrigger value="collections" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Collections</TabsTrigger>
                            <TabsTrigger value="config" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Configuration</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="invoices" className="space-y-4 focus-visible:outline-none">
                        <ArInvoiceList />
                    </TabsContent>

                    <TabsContent value="customers" className="space-y-4 focus-visible:outline-none">
                        <ArCustomerList />
                    </TabsContent>

                    <TabsContent value="receipts" className="space-y-4 focus-visible:outline-none">
                        <ArReceiptList />
                    </TabsContent>

                    <TabsContent value="credit" className="space-y-4 focus-visible:outline-none">
                        <ArCreditManagement />
                    </TabsContent>

                    <TabsContent value="revenue" className="space-y-4 focus-visible:outline-none">
                        <ArRevenueWorkbench />
                    </TabsContent>

                    <TabsContent value="collections" className="space-y-4 focus-visible:outline-none">
                        <ArCollectionsDashboard />
                    </TabsContent>
                    <TabsContent value="config" className="space-y-4 focus-visible:outline-none">
                        <Tabs defaultValue="system-options" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="system-options">System Options</TabsTrigger>
                                <TabsTrigger value="revenue-rules">Revenue Rules</TabsTrigger>
                            </TabsList>
                            <TabsContent value="system-options">
                                <ArSystemOptionsComponent />
                            </TabsContent>
                            <TabsContent value="revenue-rules">
                                <ArRevenueRules />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>

                <ArTransactionDialog
                    isOpen={isTransactionDialogOpen}
                    onClose={() => setIsTransactionDialogOpen(false)}
                />
            </div>
        </StandardPage>
    );
}
