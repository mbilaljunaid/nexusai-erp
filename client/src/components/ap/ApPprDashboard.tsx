
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    CreditCard,
    Search,
    Filter,
    Calendar,
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ApPprSideSheet } from "./ApPprSideSheet";

export function ApPprDashboard() {
    const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

    const { data: batches, isLoading } = useQuery<any[]>({
        queryKey: ['/api/ap/payment-batches'],
    });

    const handleOpenBatch = (id: number) => {
        setSelectedBatchId(id);
        setIsSideSheetOpen(true);
    };

    const handleNewBatch = () => {
        setSelectedBatchId(null);
        setIsSideSheetOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Payment Process Requests</h2>
                    <p className="text-muted-foreground">Manage bulk payments and batch confirm invoice settlements.</p>
                </div>
                <Button onClick={handleNewBatch} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Plus className="mr-2 h-4 w-4" /> New Payment Request
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Confirmation</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {batches?.filter((b: any) => b.status === "SELECTED").length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Selected and ready to pay</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Batches</CardTitle>
                            <CardDescription>A history of all payment batches processed.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm"><Filter className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm"><Search className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (batches && batches.length > 0) ? (
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="p-3 text-left font-medium">Batch Name</th>
                                            <th className="p-3 text-left font-medium">Status</th>
                                            <th className="p-3 text-left font-medium">Outflow</th>
                                            <th className="p-3 text-left font-medium">Count</th>
                                            <th className="p-3 text-left font-medium">Check Date</th>
                                            <th className="p-3 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {batches.map((batch: any) => (
                                            <tr key={batch.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => handleOpenBatch(batch.id)}>
                                                <td className="p-3 font-medium">{batch.batchName}</td>
                                                <td className="p-3">
                                                    <Badge variant={batch.status === "CONFIRMED" ? "default" : "secondary"}>
                                                        {batch.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">${Number(batch.totalAmount).toLocaleString()}</td>
                                                <td className="p-3">{batch.paymentCount} Items</td>
                                                <td className="p-3 flex items-center gap-1 opacity-70">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(batch.checkDate), "MMM dd, yyyy")}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                <CreditCard className="h-12 w-12 mx-auto opacity-10 mb-4" />
                                <p>No payment batches found.</p>
                                <p className="text-sm">Click "New Payment Request" to get started.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ApPprSideSheet
                isOpen={isSideSheetOpen}
                onClose={() => setIsSideSheetOpen(false)}
                batchId={selectedBatchId}
            />
        </div>
    );
}
