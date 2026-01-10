import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ApMetricCards } from "@/components/ap/ApMetricCards";
import { ApInvoiceList } from "@/components/ap/ApInvoiceList";
import { ApSupplierList } from "@/components/ap/ApSupplierList";
import { ApPprDashboard } from "@/components/ap/ApPprDashboard";
import { ApApprovalList } from "@/components/ap/ApApprovalList";
import ApWorkbench from "@/components/ap/ApWorkbench";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function AccountsPayable() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("workbench");
    const { toast } = useToast();

    const handleSeedData = async () => {
        try {
            // Create a test supplier
            const s = await api.ap.suppliers.create({
                name: "Acme Corp",
                taxId: "US-12345",
                country: "USA",
                riskScore: "10"
            });
            // Create a test invoice using the new format
            await api.ap.invoices.create({
                header: {
                    supplierId: s.id,
                    invoiceNumber: "INV-" + Date.now(),
                    invoiceAmount: "5000.00",
                    invoiceCurrencyCode: "USD",
                    invoiceDate: new Date(),
                    dueDate: new Date()
                },
                lines: [
                    {
                        lineNumber: 1,
                        lineType: "ITEM",
                        amount: "5000.00",
                        description: "Consulting Services"
                    }
                ]
            });
            toast({ title: "Seed Data Created", description: "Refresh or check the lists." });
            queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6 relative min-h-screen pb-20 p-6">


            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Accounts Payable
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage suppliers, invoices, and payments with AI assistance.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSeedData}>
                        Seed Demo Data
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20">
                        <Plus className="mr-2 h-4 w-4" /> New Invoice
                    </Button>
                </div>
            </div>

            {/* Metric Cards - Premium Look */}
            <ApMetricCards />

            {/* Main Content Tabs */}
            <Tabs defaultValue="invoices" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1 border shadow-sm rounded-lg lg:w-[500px]">
                        <TabsTrigger value="workbench" className="rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Workbench</TabsTrigger>
                        <TabsTrigger value="invoices" className="rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Invoices</TabsTrigger>
                        <TabsTrigger value="suppliers" className="rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Suppliers</TabsTrigger>
                        <TabsTrigger value="payments" className="rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Payments</TabsTrigger>
                        <TabsTrigger value="approvals" className="rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Approvals</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="workbench" className="space-y-4 focus-visible:outline-none">
                    <ApWorkbench />
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4 focus-visible:outline-none">
                    <ApInvoiceList />
                </TabsContent>

                <TabsContent value="suppliers" className="space-y-4 focus-visible:outline-none">
                    <ApSupplierList />
                </TabsContent>

                <TabsContent value="payments" className="space-y-4 focus-visible:outline-none">
                    <ApPprDashboard />
                </TabsContent>

                <TabsContent value="approvals" className="space-y-4 focus-visible:outline-none">
                    <ApApprovalList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
