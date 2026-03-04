import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, FileDigit, Play, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const repairSchema = z.object({
    customerId: z.string().min(1, "Customer ID is required"),
    transactionTypeId: z.string().min(1, "Transaction Type ID is required"),
    batchSourceId: z.string().min(1, "Batch Source ID is required"),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().min(1, "Description is required"),
});

export default function AutoInvoiceWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedStagingId, setSelectedStagingId] = useState<string | null>(null);

    // Queries
    const { data: stagingLines = [], isLoading: loadingStaging } = useQuery<any[]>({
        queryKey: ["/api/ar/autoinvoice/staging"],
    });

    const { data: errors = [], isLoading: loadingErrors } = useQuery<any[]>({
        queryKey: ["/api/ar/autoinvoice/errors", selectedStagingId],
        enabled: !!selectedStagingId,
    });

    // Mutations
    const importBatch = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/ar/autoinvoice/import", { method: "POST" });
            if (!res.ok) throw new Error("Failed to process AutoInvoice batch");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/autoinvoice/staging"] });
            toast({
                title: "AutoInvoice Import Complete",
                description: `Processed: ${data.processed}, Errors: ${data.errors}`,
                variant: data.errors > 0 ? "destructive" : "default",
            });
        },
        onError: (err: any) => {
            toast({
                title: "Import Error",
                description: err.message,
                variant: "destructive",
            });
        },
    });

    const repairLine = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof repairSchema> }) => {
            const res = await fetch(`/api/ar/autoinvoice/staging/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, status: "NEW" }), // Reset back to NEW for re-processing
            });
            if (!res.ok) throw new Error("Failed to repair line");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/autoinvoice/staging"] });
            setSelectedStagingId(null);
            toast({ title: "Line Repaired", description: "The staging line has been updated and queued for re-import." });
        },
    });

    // Form for Repair
    const form = useForm<z.infer<typeof repairSchema>>({
        resolver: zodResolver(repairSchema),
        defaultValues: {
            customerId: "",
            transactionTypeId: "",
            batchSourceId: "",
            amount: "",
            description: "",
        },
    });

    // Split lines by status for tabs
    const errorLines = stagingLines.filter((l: any) => l.status === "ERROR");
    const newLines = stagingLines.filter((l: any) => l.status === "NEW");
    const processedLines = stagingLines.filter((l: any) => l.status === "PROCESSED");

    // Columns for staging table
    const stagingCols = [
        { header: "Batch Source", id: "batchSourceId", width: "150px" },
        { header: "Customer ID", id: "customerId", width: "150px" },
        { header: "Trx Type", id: "transactionTypeId", width: "150px" },
        { header: "Amount", id: "amount", width: "150px" },
        { header: "Currency", id: "currency", width: "150px" },
        {
            header: "Status",
            id: "status", width: "150px",
            cell: ({ row }: any) => {
                const s = row.original.status;
                return (
                    <Badge variant={s === "PROCESSED" ? "default" : s === "ERROR" ? "destructive" : "secondary"}>
                        {s}
                    </Badge>
                );
            },
        },
        {
            header: "Actions",
            id: "actions",
            cell: ({ row }: any) => {
                const isError = row.original.status === "ERROR";
                return isError ? (
                    <Dialog open={selectedStagingId === row.original.id} onOpenChange={(open) => {
                        if (open) {
                            setSelectedStagingId(row.original.id);
                            form.reset({
                                customerId: row.original.customerId,
                                transactionTypeId: row.original.transactionTypeId,
                                batchSourceId: row.original.batchSourceId,
                                amount: row.original.amount,
                                description: row.original.description,
                            });
                        } else {
                            setSelectedStagingId(null);
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8">Repair</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Repair AutoInvoice Line</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-sm text-destructive mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Import Errors
                                    </h4>
                                    {loadingErrors ? (
                                        <div className="text-sm text-muted-foreground">Loading errors...</div>
                                    ) : (
                                        <ul className="space-y-2">
                                            {errors.map((e: any) => (
                                                <li key={e.id} className="text-sm bg-destructive/10 text-destructive p-2 rounded-md">
                                                    {e.errorMessage}
                                                </li>
                                            ))}
                                            {errors.length === 0 && <li className="text-sm text-muted-foreground list-none">No specific errors logged.</li>}
                                        </ul>
                                    )}
                                </div>
                                <div>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit((d) => repairLine.mutate({ id: row.original.id, data: d }))} className="space-y-4">
                                            <FormField control={form.control} name="customerId" render={({ field }) => (
                                                <FormItem><FormLabel>Customer ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="transactionTypeId" render={({ field }) => (
                                                <FormItem><FormLabel>Transaction Type ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="batchSourceId" render={({ field }) => (
                                                <FormItem><FormLabel>Batch Source ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="amount" render={({ field }) => (
                                                <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="description" render={({ field }) => (
                                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                                            )} />
                                            <Button type="submit" className="w-full" disabled={repairLine.isPending}>
                                                {repairLine.isPending ? "Saving..." : "Save and Queue for Re-import"}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                ) : null;
            },
        },
    ];

    return (
        <StandardPage
            title="AutoInvoice Workbench"
            description="Manage, repair, and import incoming invoice interfaces."
            actions={
                <Button onClick={() => importBatch.mutate()} disabled={importBatch.isPending || (newLines.length === 0 && errorLines.length === 0)}>
                    <Play className="w-4 h-4 mr-2" />
                    {importBatch.isPending ? "Processing..." : "Run AutoInvoice Import"}
                </Button>
            }
        >

            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-lg flex justify-between">
                            Pending Import
                            <Badge variant="secondary">{newLines.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-destructive/50">
                    <CardHeader className="py-4">
                        <CardTitle className="text-lg flex justify-between text-destructive">
                            Validation Errors
                            <Badge variant="destructive">{errorLines.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-green-500/50">
                    <CardHeader className="py-4">
                        <CardTitle className="text-lg flex justify-between text-green-600">
                            Successfully Processed
                            <Badge variant="outline" className="border-green-500 text-green-600">{processedLines.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Tabs defaultValue="errors" className="w-full">
                        <div className="border-b px-4 py-2">
                            <TabsList>
                                <TabsTrigger value="errors" className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-destructive" /> Execution Errors ({errorLines.length})
                                </TabsTrigger>
                                <TabsTrigger value="new">Pending ({newLines.length})</TabsTrigger>
                                <TabsTrigger value="processed" className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Processed ({processedLines.length})
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="errors" className="p-4 m-0">
                            <InteractiveSpreadsheet
                                data={errorLines}
                                columns={stagingCols}
                                isLoading={loadingStaging}
                             onChange={() => {}} containerHeight="600px" />
                        </TabsContent>

                        <TabsContent value="new" className="p-4 m-0">
                            <InteractiveSpreadsheet
                                data={newLines}
                                columns={stagingCols}
                                isLoading={loadingStaging}
                             onChange={() => {}} containerHeight="600px" />
                        </TabsContent>

                        <TabsContent value="processed" className="p-4 m-0">
                            <InteractiveSpreadsheet
                                data={processedLines}
                                columns={stagingCols}
                                isLoading={loadingStaging}
                             onChange={() => {}} containerHeight="600px" />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
