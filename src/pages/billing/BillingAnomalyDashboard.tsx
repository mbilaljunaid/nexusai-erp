
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Brain, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function BillingAnomalyDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Anomalies
    const { data: anomalies = [], isLoading } = useQuery({
        queryKey: ["billing-anomalies"],
        queryFn: async () => {
            const res = await fetch("/api/billing/anomalies");
            if (!res.ok) throw new Error("Failed to fetch anomalies");
            return res.json();
        }
    });

    // Scan Mutation
    const scanMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/billing/anomalies/scan", { method: "POST" });
            if (!res.ok) throw new Error("Scan failed");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["billing-anomalies"] });
            toast({
                title: "Scan Complete",
                description: `Found ${data.anomaliesFound[0].count} total anomalies from ${data.scanned} pending events.`
            });
        },
        onError: () => {
            toast({ title: "Error", description: "AI Scan failed.", variant: "destructive" });
        }
    });

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/finance/billing">Billing</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Intelligence</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing Intelligence</h1>
                    <p className="text-muted-foreground">
                        AI-powered anomaly detection for unbilled events and revenue leakage.
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={() => scanMutation.mutate()} disabled={scanMutation.isPending}>
                        {scanMutation.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                        Run AI Scan
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{anomalies.length}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Severity</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {anomalies.filter((a: any) => a.severity === "HIGH").length}
                        </div>
                        <p className="text-xs text-muted-foreground">Critical revenue risks</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Auto-Corrected</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Self-healing actions (Coming Soon)</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detected Anomalies</CardTitle>
                    <CardDescription>
                        Review and resolve flagged billing events before invoicing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date Detected</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Confidence</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Target ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
                            ) : anomalies.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No anomalies found. System healthy.</TableCell></TableRow>
                            ) : (
                                anomalies.map((anomaly: any) => (
                                    <TableRow key={anomaly.id}>
                                        <TableCell>{format(new Date(anomaly.detectedAt), "MMM d, yyyy HH:mm")}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{anomaly.anomalyType}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={anomaly.severity === "HIGH" ? "destructive" : "secondary"}>
                                                {anomaly.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{(Number(anomaly.confidence) * 100).toFixed(0)}%</TableCell>
                                        <TableCell>{anomaly.description}</TableCell>
                                        <TableCell className="font-mono text-xs">{anomaly.targetId}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
