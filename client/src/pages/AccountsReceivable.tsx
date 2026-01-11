import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    ArMetricCards,
    ArInvoiceList,
    ArCustomerList,
    ArReceiptList,
    ArTransactionDialog,
    ArRevenueWorkbench,
    ArCollectionsDashboard,
    ArSystemOptionsComponent // Added
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
        <div className="space-y-6 relative min-h-screen pb-20 p-6">


            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Accounts Receivable
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track customer billing, sales invoices, and incoming receipts with AI assistance.
                    </p>
                </div>
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
            </div>

            {/* Metric Cards */}
            <ArMetricCards />

            {/* Main Content Tabs */}
            <Tabs defaultValue="invoices" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1 border shadow-sm rounded-lg w-auto">
                        <TabsTrigger value="invoices" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Invoices</TabsTrigger>
                        <TabsTrigger value="customers" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Customers</TabsTrigger>
                        <TabsTrigger value="receipts" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Receipts</TabsTrigger>
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

                <TabsContent value="revenue" className="space-y-4 focus-visible:outline-none">
                    <ArRevenueWorkbench />
                </TabsContent>

                <TabsContent value="collections" className="space-y-4 focus-visible:outline-none">
                    <ArCollectionsDashboard />
                </TabsContent>
                <TabsContent value="config" className="space-y-4 focus-visible:outline-none">
                    <ArSystemOptionsComponent />
                </TabsContent>
            </Tabs>

            <ArTransactionDialog
                isOpen={isTransactionDialogOpen}
                onClose={() => setIsTransactionDialogOpen(false)}
            />
        </div>
    );
}
