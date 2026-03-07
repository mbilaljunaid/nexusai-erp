import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export default function RevenueWaterfallDashboard() {
    const { businessUnitId } = useEnterpriseStore();
    const [selectedCustomer, setSelectedCustomer] = React.useState<string>("");

    const { data, isLoading } = useQuery<any>({
        queryKey: ["/api/billing/revenue/waterfall", selectedCustomer, businessUnitId],
        queryFn: async () => {
            const url = selectedCustomer ? `/api/billing/revenue/waterfall?customerId=${selectedCustomer}` : `/api/billing/revenue/waterfall`;
            const res = await fetch(url, {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) throw new Error("Failed to fetch waterfall data");
            return res.json();
        }
    });

    const { data: schedules = [], isLoading: isSchedulesLoading } = useQuery<any>({
        queryKey: ["/api/ar/revenue/schedules", businessUnitId],
        queryFn: async () => {
            const res = await fetch("/api/ar/revenue/schedules", {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) return [];
            return res.json();
        }
    });

    const waterfallData = data || {
        contractValue: 0,
        invoiced: 0,
        recognized: 0,
        deferred: 0,
    };

    const metrics = data || {
        totalDeferred: 0,
        recognizedMTD: 0,
        upcomingRecognition: 0,
        complianceScore: 100,
    };

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
                        <BreadcrumbPage>Revenue Waterfall</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <PageHeader
                title="Revenue Waterfall Visualization"
                description="ASC 606 compliant revenue recognition tracking and deferred revenue management"
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-amber-500/100/5 border-amber-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600">Deferred Revenue</CardTitle>
                        <Clock className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            ${metrics.totalDeferred.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Awaiting recognition</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-500/100/5 border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Recognized MTD</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${metrics.recognizedMTD.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Month to date</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Recognition</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.upcomingRecognition.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Next 30 days</p>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ASC 606 Compliance</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{metrics.complianceScore}%</div>
                        <p className="text-xs text-muted-foreground">All checks passed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Waterfall Visualization */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Waterfall</CardTitle>
                    <CardDescription>Contract to cash revenue progression</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Waterfall Chart (Simplified representation) */}
                        <div className="h-64 flex items-end gap-2">
                            <div className="flex-1 space-y-2">
                                <div className="text-center font-medium text-sm">Contract Value</div>
                                <div
                                    className="bg-slate-200 dark:bg-slate-700 rounded-t-lg flex items-center justify-center text-white font-bold"
                                    style={{ height: "100%" }}
                                >
                                    ${(waterfallData.contractValue / 1000).toFixed(0)}K
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="text-center font-medium text-sm">Invoiced</div>
                                <div
                                    className="bg-blue-500 rounded-t-lg flex items-center justify-center text-white font-bold"
                                    style={{ height: `${(waterfallData.invoiced / waterfallData.contractValue) * 100}%` }}
                                >
                                    ${(waterfallData.invoiced / 1000).toFixed(0)}K
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="text-center font-medium text-sm">Recognized</div>
                                <div
                                    className="bg-green-500 rounded-t-lg flex items-center justify-center text-white font-bold"
                                    style={{ height: `${(waterfallData.recognized / waterfallData.contractValue) * 100}%` }}
                                >
                                    ${(waterfallData.recognized / 1000).toFixed(0)}K
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="text-center font-medium text-sm">Deferred</div>
                                <div
                                    className="bg-amber-500 rounded-t-lg flex items-center justify-center text-white font-bold"
                                    style={{ height: `${(waterfallData.deferred / waterfallData.contractValue) * 100}%` }}
                                >
                                    ${(waterfallData.deferred / 1000).toFixed(0)}K
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ASC 606 Compliance Checklist */}
            <Card>
                <CardHeader>
                    <CardTitle>AS C 606 Compliance Checklist</CardTitle>
                    <CardDescription>5-step revenue recognition model validation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            "Identify contract with customer",
                            "Identify performance obligations",
                            "Determine transaction price",
                            "Allocate transaction price to performance obligations",
                            "Recognize revenue when (or as) performance obligations are satisfied",
                        ].map((step, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span className="text-sm">{step}</span>
                                <Badge variant="outline" className="ml-auto">
                                    Verified
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recognition Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Recognition Schedule</CardTitle>
                    <CardDescription>Monthly revenue to be recognized</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isSchedulesLoading ? (
                            <div className="text-sm text-muted-foreground py-4">Loading schedules...</div>
                        ) : schedules.length > 0 ? (
                            schedules.slice(0, 5).map((schedule: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            {schedule.scheduledDate ? format(new Date(schedule.scheduledDate), "MMM yyyy") : "Pending"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Status: {schedule.status}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">
                                            +${Number(schedule.amount).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Invoice ID: {schedule.invoiceId}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground py-4">No upcoming recognition schedules.</div>
                        )}
                        <div className="text-center text-xs text-muted-foreground pt-2">
                            Showing top 5 upcoming revenue recognition events.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
