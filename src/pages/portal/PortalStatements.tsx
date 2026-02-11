import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { format, parse } from "date-fns";
import { Download, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalStatements() {
    const { data: statements, isLoading } = useQuery({
        queryKey: ["/api/portal/statements"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/portal/statements");
            return res.json();
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Statements</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly Statements</CardTitle>
                </CardHeader>
                <CardContent>
                    {statements && statements.length > 0 ? (
                        <div className="space-y-3">
                            {statements.map((stmt: any) => {
                                const periodDate = parse(stmt.period, "yyyy-MM", new Date());
                                const periodName = format(periodDate, "MMMM yyyy");

                                return (
                                    <div key={stmt.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{periodName}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(stmt.startDate), "MMM dd")} - {format(new Date(stmt.endDate), "MMM dd, yyyy")}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">Invoiced</p>
                                                    <p className="font-semibold">${Number(stmt.totalInvoiced).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">Paid</p>
                                                    <p className="font-semibold text-emerald-600">${Number(stmt.totalPaid).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">Balance</p>
                                                    <p className={`font-semibold ${stmt.balance > 0 ? "text-red-600" : "text-slate-900"}`}>
                                                        ${Number(stmt.balance).toLocaleString()}
                                                    </p>
                                                </div>

                                                <Button variant="outline" size="sm" onClick={() => {
                                                    window.open(`/api/portal/statements/${stmt.period}/pdf`, '_blank');
                                                }}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    PDF
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Aging Breakdown */}
                                        {stmt.balance > 0 && (
                                            <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t">
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground">Current</p>
                                                    <p className="font-medium text-sm">${Number(stmt.current || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground">1-30 days</p>
                                                    <p className="font-medium text-sm text-amber-600">${Number(stmt.days30 || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground">31-60 days</p>
                                                    <p className="font-medium text-sm text-orange-600">${Number(stmt.days60 || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground">90+ days</p>
                                                    <p className="font-medium text-sm text-red-600">${Number(stmt.days90Plus || 0).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No statements available</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
