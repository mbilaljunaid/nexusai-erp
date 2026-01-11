import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { Link } from "wouter";
import { ApMetricCards } from "@/components/ap/ApMetricCards";
import { ApInvoiceList } from "@/components/ap/ApInvoiceList";
import { ApSupplierList } from "@/components/ap/ApSupplierList";
import { ApPprDashboard } from "@/components/ap/ApPprDashboard";
import { ApApprovalList } from "@/components/ap/ApApprovalList";
import ApWorkbench from "@/components/ap/ApWorkbench";
import { ApInvoiceCapture } from "@/components/ap/ApInvoiceCapture";
import ApAgingReport from "@/components/ap/ApAgingReport";
import ApAuditTrail from "@/components/ap/ApAuditTrail";
import ApPeriodClose from "@/components/ap/ApPeriodClose";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Sparkles } from "lucide-react";

export default function AccountsPayable() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("workbench");
    const [isCaptureOpen, setIsCaptureOpen] = useState(false);
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
                    <Link href="/ap/settings">
                        <Button variant="outline">
                            <Settings className="mr-2 h-4 w-4" /> Settings
                        </Button>
                    </Link>
                    <Button
                        onClick={() => setIsCaptureOpen(true)}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
                    >
                        <Sparkles className="mr-2 h-4 w-4" /> AI Capture
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20">
                        <Plus className="mr-2 h-4 w-4" /> New Invoice
                    </Button>
                </div>
            </div>

            <ApInvoiceCapture open={isCaptureOpen} onOpenChange={setIsCaptureOpen} />

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
                        <TabsTrigger value="reporting" className="rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Reporting</TabsTrigger>
                        <TabsTrigger value="control" className="rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Control</TabsTrigger>
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

                <TabsContent value="reporting" className="space-y-6 focus-visible:outline-none">
                    <Tabs defaultValue="aging">
                        <TabsList className="grid grid-cols-2 w-[300px] mb-4">
                            <TabsTrigger value="aging">Aging Report</TabsTrigger>
                            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                        </TabsList>
                        <TabsContent value="aging">
                            <ApAgingReport />
                        </TabsContent>
                        <TabsContent value="audit">
                            <ApAuditTrail />
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="control" className="space-y-4 focus-visible:outline-none">
                    <ApPeriodClose />
                </TabsContent>
            </Tabs>
        </div>
    );
}
