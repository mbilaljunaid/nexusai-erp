import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, CheckCircle, Loader2, AlertTriangle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Badge } from "@/components/ui/badge";

export default function SlaDashboard() {
    const { toast } = useToast();

    const transferMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/sla/transfer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ledgerId: "PRIMARY" }) // Default for now
            });
            if (!res.ok) throw new Error("Transfer failed");
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "GL Transfer Complete",
                description: `Successfully created Batch ${data.batchId} with ${data.journalCount} journals.`,
            });
        },
        onError: () => {
            toast({
                title: "Transfer Failed",
                description: "An error occurred while transferring journals to GL.",
                variant: "destructive"
            });
        }
    });

    return (
        <StandardPage
            title="SLA Operations Center"
            description="Manage Subledger Accounting processes and integration."
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "SLA Dashboard" }]}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Untransferred Journals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground mt-1">Pending transfer to GL</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Transferred Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground mt-1">Journals posted to GL</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">Processing exceptions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Operations Panel */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowRightLeft className="h-5 w-5 text-primary" />
                                GL Transfer
                            </CardTitle>
                            <CardDescription>
                                Transfer verified "Final" SLA journals to the General Ledger. This creates GL Batches and Journals.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted/30 p-4 rounded-md border mb-4">
                                <h4 className="text-sm font-medium mb-2">Process Parameters</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Ledger:</span> <span className="font-mono">PRIMARY</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Mode:</span> <Badge variant="outline">Detail</Badge>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                onClick={() => transferMutation.mutate()}
                                disabled={transferMutation.isPending}
                            >
                                {transferMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Transferring...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Run GL Transfer
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                Diagnostics
                            </CardTitle>
                            <CardDescription>
                                Tools for analyzing accounting issues.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                View Unaccounted Events
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                View Transfer Errors
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Panel (Placeholder) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Batches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No recent transfer activity found.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
