import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    ArMetricCards,
    ArInvoiceList,
    ArCustomerList,
    ArReceiptList
} from "@/components/ar";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function AccountsReceivable() {
    const [activeTab, setActiveTab] = useState("invoices");
    const { toast } = useToast();

    const handleSeedData = async () => {
        try {
            // Create a test customer
            const c = await api.ar.customers.create({
                name: "Globex Corp",
                taxId: "TX-98765",
                customerType: "Commercial",
                creditLimit: "10000.00",
                balance: "0.00"
            });

            // Create a test invoice
            await api.ar.invoices.create({
                customerId: c.id,
                invoiceNumber: "SINV-" + Date.now(),
                amount: "2500.00",
                taxAmount: "250.00",
                totalAmount: "2750.00",
                currency: "USD",
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            });

            toast({ title: "AR Seed Data Created", description: "Refresh or check the lists." });
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
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20">
                        <Plus className="mr-2 h-4 w-4" /> New Sales Invoice
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <ArMetricCards />

            {/* Main Content Tabs */}
            <Tabs defaultValue="invoices" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1 border shadow-sm rounded-lg lg:w-[350px]">
                        <TabsTrigger value="invoices" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Invoices</TabsTrigger>
                        <TabsTrigger value="customers" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Customers</TabsTrigger>
                        <TabsTrigger value="receipts" className="rounded-md data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">Receipts</TabsTrigger>
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
            </Tabs>
        </div>
    );
}
