
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, RefreshCcw, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Anomaly {
    journalId: string;
    description: string;
    amount: string;
    confidence: number;
    reason: string;
    severity: "High" | "Medium" | "Low";
}

export function AnomaliesWidget() {
    const { data: anomalies, isLoading, refetch } = useQuery<Anomaly[]>({
        queryKey: ["gl-anomalies"],
        queryFn: async () => {
            const res = await fetch("/api/gl/anomalies");
            if (!res.ok) throw new Error("Failed to fetch anomalies");
            return res.json();
        },
        // Don't refetch too often automatically for now
        staleTime: 60000
    });

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        AI Anomaly Detector
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground animate-pulse">Scanning ledgers...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const count = anomalies?.length || 0;

    return (
        <Card className="h-full border-orange-200 bg-orange-50/30 dark:bg-orange-950/10 dark:border-orange-900">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        AI Anomaly Detector
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => refetch()}>
                        <RefreshCcw className="h-3 w-3" />
                    </Button>
                </div>
                <CardDescription>
                    {count === 0
                        ? "No anomalies detected in recent journals."
                        : `${count} potential issues detected requiring review.`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {count === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm font-medium">All Clean!</p>
                        <p className="text-xs text-muted-foreground">No suspicious patterns found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {anomalies?.slice(0, 3).map((anomaly) => (
                            <div key={anomaly.journalId} className="bg-background rounded-lg p-3 border shadow-sm text-sm">
                                <div className="flex items-start justify-between mb-1">
                                    <span className="font-semibold truncate pr-2">{anomaly.description}</span>
                                    <Badge variant={anomaly.severity === "High" ? "destructive" : "outline"} className="text-[10px] px-1 py-0 h-5">
                                        {anomaly.severity}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                                    <span>{anomaly.amount}</span>
                                    <span className="text-orange-600 font-medium">{anomaly.reason}</span>
                                </div>
                            </div>
                        ))}
                        {count > 3 && (
                            <Button variant="ghost" className="w-full text-xs h-8">
                                View All {count} Anomalies <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
